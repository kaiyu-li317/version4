// 临时内存存储（用于 KV 存储未申请时的测试）
const tempStorage = {
  posts: new Map(),
  likes: new Map(),
  comments: new Map()
};

export async function onRequest({ request, env }) {
  const { pathname } = new URL(request.url);
  
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  if (pathname === '/api/posts' && request.method === 'GET') {
    try {
      // 获取所有帖子
      let posts = Array.from(tempStorage.posts.values());
      
      // 如果临时存储中没有，尝试从 KV 获取
      if (posts.length === 0 && env.bugdex_kv) {
        posts = [];
        let cursor;
        
        do {
          const result = await env.bugdex_kv.list({ prefix: 'post:', cursor });
          for (const key of result.keys) {
            const post = await env.bugdex_kv.get(key.key, { type: 'json' });
            if (post) posts.push(post);
          }
          cursor = result.cursor;
        } while (!result.complete);
      }
      
      // 按创建时间排序
      posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return new Response(JSON.stringify(posts), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: '获取帖子失败'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  if (pathname === '/api/posts' && request.method === 'POST') {
    try {
      const { title, content, image_url, codefile_url } = await request.json();
      
      // 获取用户信息（从 token）
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({
          success: false,
          message: '请先登录'
        }), {
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const userData = JSON.parse(atob(token));
      
      // 创建帖子
      const postId = `post_${Date.now()}`;
      const post = {
        id: postId,
        title,
        content,
        image_url,
        codefile_url,
        username: userData.username,
        likes_count: 0,
        created_at: new Date().toISOString()
      };
      
      // 保存到临时存储
      tempStorage.posts.set(postId, post);
      
      // 如果 KV 可用，也保存到 KV
      if (env.bugdex_kv) {
        await env.bugdex_kv.put(`post:${postId}`, JSON.stringify(post));
      }
      
      return new Response(JSON.stringify(post), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: '发布帖子失败'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  if (pathname.startsWith('/api/posts/') && pathname.endsWith('/like') && request.method === 'POST') {
    try {
      const postId = pathname.split('/')[3];
      
      // 获取用户信息
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({
          success: false,
          message: '请先登录'
        }), {
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const userData = JSON.parse(atob(token));
      
      // 检查是否已经点赞
      const likeKey = `${postId}:${userData.username}`;
      const existingLike = tempStorage.likes.get(likeKey);
      
      if (existingLike) {
        return new Response(JSON.stringify({
          success: false,
          message: '已经点赞过了'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // 添加点赞记录
      const likeData = {
        post_id: postId,
        username: userData.username,
        created_at: new Date().toISOString()
      };
      
      tempStorage.likes.set(likeKey, likeData);
      
      // 如果 KV 可用，也保存到 KV
      if (env.bugdex_kv) {
        await env.bugdex_kv.put(`like:${likeKey}`, JSON.stringify(likeData));
      }
      
      // 更新帖子点赞数
      let post = tempStorage.posts.get(postId);
      if (!post && env.bugdex_kv) {
        post = await env.bugdex_kv.get(`post:${postId}`, { type: 'json' });
      }
      
      if (post) {
        post.likes_count = (post.likes_count || 0) + 1;
        tempStorage.posts.set(postId, post);
        
        if (env.bugdex_kv) {
          await env.bugdex_kv.put(`post:${postId}`, JSON.stringify(post));
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        likes_count: post.likes_count
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: '点赞失败'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  if (pathname.startsWith('/api/posts/') && pathname.endsWith('/comments') && request.method === 'POST') {
    try {
      const postId = pathname.split('/')[3];
      const { content } = await request.json();
      
      // 获取用户信息
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({
          success: false,
          message: '请先登录'
        }), {
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const userData = JSON.parse(atob(token));
      
      // 创建评论
      const commentId = `comment_${Date.now()}`;
      const comment = {
        id: commentId,
        post_id: postId,
        username: userData.username,
        content,
        created_at: new Date().toISOString()
      };
      
      // 保存到临时存储
      tempStorage.comments.set(commentId, comment);
      
      // 如果 KV 可用，也保存到 KV
      if (env.bugdex_kv) {
        await env.bugdex_kv.put(`comment:${commentId}`, JSON.stringify(comment));
      }
      
      return new Response(JSON.stringify(comment), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: '发表评论失败'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  return new Response(JSON.stringify({
    success: false,
    message: '接口不存在'
  }), {
    status: 404,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 