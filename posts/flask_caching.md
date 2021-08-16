---
title: 利用 flask_caching 添加缓存
description: This is a post on My Blog about agile frameworks.
date: 2021-08-15
layout: layouts/post.njk
tags:
  - tech
image: https://cdn.pixabay.com/photo/2020/08/30/20/54/rice-field-5530707_1280.jpg
---

#### 背景

工作中接到反馈，我负责的服务在跑数过程中经常会遇到一些业务逻辑的变化而重刷数据，相同的数据要反复的请求服务，而服务中用到了深度学习模型，比较耗时，因此希望添加缓存

#### 需求

1. 为服务添加缓存，收到服务之后，优先查询缓存，缓存没有才去调用服务
2. 如果请求返回的是exception error， 不需要缓存（有可能是model 服务不稳定造成的）
3. 如果请求中明确说明不用缓存，需要跳过

#### 技术方案
Flask_Caching 库基本可以满足要求 （选择第三方库尽量选择一直有维护的，比如还有一个库 flask_cache已经超过一年没有 commit 了，尽量不要选）

#### 具体实施关键点

针对需求，进一步考虑实现过程中可能会遇到的问题，有时候未必考虑的清楚，可能需要在实施的时候才能够发现，但是这一步提前考虑是需要做的

1. 用什么作为缓存的key?
本服务的 api请求  是json格式的POST， 我们需要用请求的字段作为key

2. 缓存过期时间？
缓存可以设置自动失效时间，因为 ETL 一般重刷任务间隔时间是比较短的，通过配置参数 CACHE_DEFAULT_TIMEOUT 在cache初始化的时候传入即可，cache在到期之后会自动删除掉，这样不需要为每个函数单独指定失效时间

```python
    from flask import Flask
    from flask_caching import Cache
    config = {
        "DEBUG": True,          # some Flask specific configs
        "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
        "CACHE_DEFAULT_TIMEOUT": 300
    }
    app = Flask(__name__)
    # tell Flask to use the above defined config
    app.config.from_mapping(config)
    cache = Cache(app)
```

3. 如何实现当服务有正常结果的时候就缓存，没有正常结果的时候就不缓存
通过查看 flask_caching的文档发现,  这个库是通过添加 caching.cached 装饰器来实现缓存的
@app.route("/")
@cache.cached(timeout=50)
def index():
    return render_template('index.html')

进一步去看 cache.cached 本身的代码(省略无关的代码), 
  - 函数本身返回的是一个装饰器
  - 有下面的字段是和要不要设置缓存相关的
    - response_filter:   发生在主逻辑计算之后，对结果进行过滤，比如我们可以设置如果结果是500错误就不缓存了
    - unless: 发生在主逻辑计算之前,  可以设置一个特殊条件，如果满足，那么不走缓存（也不会保存缓存了）
  

我们希望发生 500错误不需要缓存，那么response_filter这个参数比较符合要求，此外还有一个比较隐蔽的做法，就是如果路由函数执行的死后抛出了异常，这个时候异常交给单独的error handler 处理，其实也是不会保存缓存的
> Alternately, looking at the code for Flask-Cache it appears it 
does not handle errors thrown by the view
. So you could   simply raise the error yourself and handle the exception with a separate handler:
                                                   摘自 stack overflow



由于开发时候没有仔细看文档😢，具体实现采用的是“比较隐蔽的做法”， response_filter 应该更加直观。

```python 
def cached(
    self,
    timeout: Optional[int] = None,
    key_prefix: str = "view/%s",
    unless: Optional[Callable] = None,
    forced_update: Optional[Callable] = None,
    response_filter: Optional[Callable] = None,
    query_string: bool = False,
    hash_method: Callable = hashlib.md5,
    cache_none: bool = False,
    make_cache_key: Optional[Callable] = None,
    source_check: Optional[bool] = None,
) -> Callable:
       """Decorator. Use this to cache a function. By default the cache key
    is `view/request.path`. You are able to use this decorator with any
    function by changing the `key_prefix`. If the token `%s` is located
    within the `key_prefix` then it will replace that with `request.path`
    
    Example::
    
        # An example view function
        @cache.cached(timeout=50)
        def big_foo():
            return big_bar_calc()
    
        # An example misc function to cache.
        @cache.cached(key_prefix='MyCachedList')
        def get_list():
            return [random.randrange(0, 1) for i in range(50000)]
    
        my_list = get_list()
    
    .. note::
    
        You MUST have a request context to actually called any functions
        that are cached.
    
    .. versionadded:: 0.4
        The returned decorated function now has three function attributes
        assigned to it. These attributes are readable/writable.
    
            **uncached**
                The original undecorated function
    
            **cache_timeout**
                The cache timeout value for this function. For a
                custom value to take affect, this must be set before the
                function is called.
    
            **make_cache_key**
                A function used in generating the cache_key used.
    
                readable and writable
    
    :param timeout: Default None. If set to an integer, will cache for that
                    amount of time. Unit of time is in seconds.
    
    :param key_prefix: Default 'view/%(request.path)s'. Beginning key to .
                       use for the cache key. `request.path` will be the
                       actual request path, or in cases where the
                       `make_cache_key`-function is called from other
                       views it will be the expected URL for the view
                       as generated by Flask's `url_for()`.
    
                       .. versionadded:: 0.3.4
                           Can optionally be a callable which takes
                           no arguments but returns a string that will
                           be used as the cache_key.
    
    :param unless: Default None. Cache will *always* execute the caching
                   facilities unless this callable is true.
                   This will bypass the caching entirely.
    
    :param forced_update: Default None. If this callable is true,
                          cache value will be updated regardless cache
                          is expired or not. Useful for background
                          renewal of cached functions.
    
    :param response_filter: Default None. If not None, the callable is
                            invoked after the cached funtion evaluation,
                            and is given one arguement, the response
                            content. If the callable returns False, the
                            content will not be cached. Useful to prevent
                            caching of code 500 responses.
    
    :param query_string: Default False. When True, the cache key
                         used will be the result of hashing the
                         ordered query string parameters. This
                         avoids creating different caches for
                         the same query just because the parameters
                         were passed in a different order. See
                         _make_cache_key_query_string() for more
                         details.
    
    :param hash_method: Default hashlib.md5. The hash method used to
                        generate the keys for cached results.
    :param cache_none: Default False. If set to True, add a key exists
                       check when cache.get returns None. This will likely
                       lead to wrongly returned None values in concurrent
                       situations and is not recommended to use.
    :param make_cache_key: Default None. If set to a callable object,
                       it will be called to generate the cache key
    
    :param source_check: Default None. If None will use the value set by
                         CACHE_SOURCE_CHECK.
                         If True, include the function's source code in the
                         hash to avoid using cached values when the source
                         code has changed and the input values remain the
                         same. This ensures that the cache_key will be
                         formed with the function's source code hash in
                         addition to other parameters that may be included
                         in the formation of the key.
     
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            #: Bypass the cache entirely.
            if self._bypass_cache(unless, f, *args, **kwargs):
                return f(*args, **kwargs)

            nonlocal source_check
            if source_check is None:
                source_check = self.source_check

            try:
                # 首先计算 cached_key 
                if make_cache_key is not None and callable(make_cache_key):
                    cache_key = make_cache_key(*args, **kwargs)
                else:
                    cache_key = _make_cache_key(
                        args, kwargs, use_request=True
                    )
                
                # 查询缓存
                if (
                    callable(forced_update)
                    and (
                        forced_update(*args, **kwargs)
                        if wants_args(forced_update)
                        else forced_update()
                    )
                    is True
                ):
                    rv = None
                    found = False
                else:
                    rv = self.cache.get(cache_key)
                    found = True

                    # If the value returned by cache.get() is None, it
                    # might be because the key is not found in the cache
                    # or because the cached value is actually None
                    if rv is None:
                        # If we're sure we don't need to cache None values
                        # (cache_none=False), don't bother checking for
                        # key existence, as it can lead to false positives
                        # if a concurrent call already cached the
                        # key between steps. This would cause us to
                        # return None when we shouldn't
                        if not cache_none:
                            found = False
                        else:
                            found = self.cache.has(cache_key)
            except Exception:
                if self.app.debug:
                    raise
                logger.exception("Exception possibly due to cache backend.")
                # 如果在查询缓存的时候遇到了错误，就会进入本身的函数计算
                return f(*args, **kwargs)
                
            # 如果没有缓存，执行本身函数
            if not found:
                # 注意这一行, 如果在执行 f(*args, **kwargs)的时候报错，也不会再执行下面的环节了
                rv = f(*args, **kwargs)
                if response_filter is None or response_filter(rv):
                    try:
                        self.cache.set(
                            cache_key,
                            rv,
                            timeout=decorated_function.cache_timeout,
                        )
                    except Exception:
                        if self.app.debug:
                            raise
                        logger.exception(
                            "Exception possibly due to cache backend."
                        )
            return rv

        def default_make_cache_key(*args, **kwargs):
            # Convert non-keyword arguments (which is the way
            # `make_cache_key` expects them) to keyword arguments
            # (the way `url_for` expects them)
            argspec_args = inspect.getfullargspec(f).args

            for arg_name, arg in zip(argspec_args, args):
                kwargs[arg_name] = arg

            return _make_cache_key(args, kwargs, use_request=False)

        def _make_cache_key_query_string():
            pass

        def _make_cache_key(args, kwargs, use_request):
            pass

    return decorator
```

4. 如果在请求中显式的声明了不使用缓存，如何跳过缓存
  根据上面的分析，unless 参数其实是可以完美适用的，我们为请求添加一个 bypass 参数，默认是false， 表示优先使用缓存， 如果传入 true, 就跳过缓存 ，然后给 cache.cached 传入 unless 参数为当前请求的bypass参数就好了
`
```python 
def is_bypass():
    payload = request.json
    return payload.get('bypass', False)
    

@app.route("/analysis", methods=["POST"])
@cache.cached(key_prefix=cache_key, unless=is_bypass)
def analysis():
    # 主路由函数负责处理 api 调用
    pass
````

5. 如何限制缓存的占用空间大小？
flask_caching 支持多种缓存的后端，可以是可flask 程序同一个进程里面的cache，可以是单独存在文件系统中，可以是redis, memcached 数据库作为缓存后端，甚至可以单独定义一个你自己的缓存后端，只要符合flask_caching所要求的的api接口就可以。
简单起见，我们用了 redis作为缓存后端，利用 k8s 启动redis container的时候限制一下 redis 占用的最大内存就好了，没有用什么缓存淘汰算法 (比如 LRU )

```yaml
    # ....以上省略....
    - name: social-nlp-redis
    image: redis:4.0.14
    ports:
        - containerPort: 6379
    resources:
        requests:
        memory: 256Mi
        limits:
        memory: 1Gi
```

#### 测试

对下面的关键点进行测试，保证改动是可以满足需求的

- 测试 unless 参数是够生效 (手动修改传入的参数 bypass 为 true，查看是否有执行到路由函数内部)
- 测试 500 错误是不是缓存了（把model svc地址填错构造一个错误）
- 测试缓存失效的时候能够正常使用 （关掉redis 服务）
- 测试开关缓存时wrk性能区别（<200    =>    1000+）

#### 附录

- 缓存的简单介绍  https://www.youtube.com/watch?v=U3RkDLtS7uY (印度小哥飚英语)
