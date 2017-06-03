(function(window) {
	
	var 
		arr = [],
		push = arr.push,
		slice = arr.slice,
		sort = arr.sort,
		splice = arr.splice;

	// 工厂函数, 隐藏new创建对象
	var cl = function( selector ) {
		return new cl.prototype.init(selector);
	};
	
	// fn 就是 prototype 的简写，目的：少写几个字符！
	cl.fn = cl.prototype = {
		// 版本号
		cl: '1.0.0',

		// 默认长度为：0
		length: 0,

		constructor: cl,

		// 真正的构造函数
		init: function( selector ) {
			// 1 处理不合法值：null/undefined/0/false/''
			if( !selector ) {
				// 直接将 this 返回
				return this;
			}

			// 2 参数为 string 类型
			// else if(typeof selector === 'string') {
			else if( cl.isString(selector) ) {
				if(selector.charAt(0) === '<') {
					// html 字符串
					push.apply( this, parseHTML(selector) );
				} else {
					// 选择器的情况
					push.apply(this, document.querySelectorAll(selector));
					this.selector = selector;
				}
			}

			// 3 参数为函数：入口函数
			// else if(typeof selector === 'function') {
			else if( cl.isFunction(selector) ) {
				document.addEventListener('DOMContentLoaded', selector);
			}

			// 4 参数为：DOM对象
			// 如何判断对象是DOM对象？？ nodeType
			// 	通过 nodeType 属性来判断，因为每一个DOM对象都具有这个属性
			// else if(!!selector.nodeType) {
			else if( cl.isDOM(selector) ) {
				// push.call(this, selector);
				this[0] = selector;
				this.length = 1;
				return this;
			}

			// 5 参数为数组 或 伪数组 或 cl对象（伪数组）
			// 		都转化为：伪数组
			// else if ( 'length' in selector && selector.length >= 0 ) {
			else if ( cl.isArrayLike(selector) ) {
				// 将伪数组中的每一个元素 都放到 this
				push.apply(this, selector);

				// 第一个 selector：是一个伪数组
				// 第二个 selector：是当前伪数组的属性
				if(selector.selector) {
					this.selector = selector.selector;
				}
			}
		},

		// 将 this 伪数组转化为：真数组
		toArray: function() {

			return slice.call(this);
		},
		
		// 将 cl 对象，转化为：DOM对象
		get: function( index ) {
			if(index == null) {
				return this.toArray();
			}
			index = index >= 0 ? index : (this.length + index);
			// this 就是一个伪数组！
			return this[index];
		},

		eq: function( index ) {

			return this.pushStack( this.get(index) );
		},

		first: function() {

			return this.eq(0);
		},
		
		last: function() {

			return this.eq(-1);
		},
		
		end: function() {
			// this.constructor() 为了避免获取不到 prevObject 而报错!
			return this.prevObject || this.constructor();
		},
		
		pushStack: function( arr ) {
			var newIObj = cl( arr );
			newIObj.prevObject = this;

			return newIObj;
		},

		// 让原型长得像 数组的原型
		push: push,
		sort: sort,
		splice: splice
	};
	
	// 因为在沙箱的外部只能够访问到 cl 函数
	cl.prototype.init.prototype = cl.prototype;
	
	// 扩展方法
	cl.fn.extend = cl.extend = function(obj) {
		for(var k in obj) {
			if( obj.hasOwnProperty(k) ) {
				this[k] = obj[k];
			}
		}
	};
	
	// 将 html 字符串 转化为 DOM对象（集合）
	var parseHTML = function( htmlSring ) {
		var container = document.createElement('div');
		container.innerHTML = htmlSring;

		return container.children;
	};
	
	// 静态方法 each / map / trim
	cl.extend({
		each: function(obj, callback) {
      var i, length;

      if( cl.isArrayLike(obj) ) {

        for(i = 0, length = obj.length; i < length; i++) {
          if( callback.call(obj[i], i, obj[i]) === false ) {
            break;
          }
        }
      } else {
        
        for(i in obj) {
          if( callback.call(obj[i], i, obj[i]) === false ) {
            break;
          }
        }
      }

      return obj;
    },

    map: function(obj, callback) {
			var i, temp, ret = [];
			if( cl.isArrayLike(obj) ) {

				for(i = 0; i < obj.length; i++) {
					temp = callback(obj[i], i)
					if(temp != null) {
						ret.push( temp );
					}
				}
			} else {

				for(i in obj) {
					temp = callback(obj[i], i)
					if(temp != null) {
						ret.push( temp );
					}
				}
			}

			return ret;
		},

		// 去除字符串两端的空格
		trim: function( str ) {
			if( String.prototype.trim ) {
				return str.trim();
			}

			return str.replace(/^\s+|\s+$/g, '');
		}
	});
	
	// 实例方法 each
	cl.prototype.extend({
		each: function( callback ) {

			return cl.each(this, callback);
		},
		
		map: function( callback ) {
			// cl.map(this, callback);
			var ret = cl.map(this, function(value, index) {
				// 解决了：
				// 1 callback方法中 this 指向的问题
				// 2 callback方法参数的顺序问题
				// 3 需要返回值
				return callback.call(value, index, value);
			});

			// 解决了： 返回值是 cl对象 的问题，并实现了链式编程！
			return this.pushStack( ret );
		}
	});
	
	// 类型判断模块
	cl.extend({
		isString: function( obj ) {
			return typeof obj === 'string';
		},
		isFunction: function( obj ) {
			return typeof obj === 'function';
		},
		isDOM: function( obj ) {
			return obj && !!obj.nodeType;
		},
		isWindow: function( obj ) {
			return !!obj && obj.window === obj;
		},
		isArrayLike: function( obj ) {
			if( cl.isFunction(obj) || cl.isWindow(obj) ) {
				return false;
			}
			
			if('length' in obj && obj.length >= 0) {
				return true;
			}

			return false;
		}
	});

	// 获取指定元素的下一个元素节点
	var getNextElm = function( node ) {
		// 获取node的下一个元素节点
		// 1 获取当前节点的下一个节点
		// 2 如果下一个节点为null，循环就会停止
		while( node = node.nextSibling ) {
			if(node.nodeType === 1) {
				return node;
			}
		}

		return null;
	};

	// 获取指定元素的上一个元素节点
	var getPrevElm = function( node ) {
		while( node = node.previousSibling ) {
			if(node.nodeType === 1) {
				return node;
			}
		}

		return null;
	};

	// 获取指定元素后面所有的元素节点
	var getNextAllElms = function( node ) {
		var ret = [];
		while( node = node.nextSibling ) {
			if(node.nodeType === 1) {
				// return node;
				ret.push( node );
			}
		}

		return ret;
	};

	var getPervAllElms = function( node ) {
		var ret = [];
		while( node = node.previousSibling ) {
			if(node.nodeType === 1) {
				// return node;
				ret.push( node );
			}
		}

		return ret;
	};
	
	// DOM操作模块
	cl.fn.extend({
		// 追加元素
		// cl('p').appendTo('div')
		appendTo: function( node ) {
			var srcElms = this,
				tarElms = cl( node ),
				tarLength = tarElms.length,
				tempNode = null, // 用来存储克隆出来的DOM对象
				ret = []; // 用来存储所有的数据源

			tarElms.each(function(index) {
				var that = this;

				srcElms.each(function() {
					// tempNode 用来接受所有的节点(包含克隆出来的元素)
					tempNode = (index === tarLength-1) ? this: this.cloneNode(true);
					/// 将元素追加到目标对象中
					that.appendChild( tempNode );
					// 存储元素 (数据源)
					ret.push( tempNode );
				});
			});

			return this.pushStack(ret);
		},

		// 追加元素
		// cl('div').append('p')
		append: function( node ) {
			cl(node).appendTo( this );

			// 因为这个方法, 没有破坏链, 所以, 只需要将 this 返回即可!
			return this;
		},

		// 插入元素
		prependTo: function( node ) {
			var srcElms = this,
				tarElms = cl( node ),
				tarLength = tarElms.length,
				tempNode = null,
				ret = [];

			tarElms.each(function(index, value) {
				// 目的: 为了处理插入元素的顺序!
				var first = value.firstChild;

				srcElms.each(function() {
					tempNode = (index === tarLength-1) ? this : this.cloneNode(true);

					value.insertBefore(tempNode, first);
					ret.push( tempNode );
				})
			});

			return this.pushStack( ret );
		},
		
		// 插入元素
		prepend: function( node ) {
			cl(node).prependTo( this );

			return this;
		},

		// 获取下一个兄弟元素
		next: function() {
			// this 就是 cl对象
			return this.map(function() {
				return getNextElm( this );
			});
		},

		// 获取上一个兄弟元素
		prev: function() {
			return this.map(function() {

				return getPrevElm( this );
			})
		},
		
		// 获取后面所有的兄弟元素
		nextAll: function() {
			var ret = [];
			this.each(function() {
				var temp = getNextAllElms(this);
				
				cl.each(temp, function() {
					(ret.indexOf(this) < 0) && ret.push( this );
				});
			});

			return this.pushStack( ret );
		},

		// 获取前面所有的兄弟元素
		prevAll: function() {
			var ret = [];
			this.each(function() {
				var temp = getPervAllElms(this);
				cl.each(temp, function() {
					(ret.indexOf(this) < 0) && ret.push( this );
				});

			});
			
			return this.pushStack( ret );
		}
	});
	
	// 事件操作模块
	cl.fn.extend({
		on: function(evnetType, callback) {
			return this.each(function() {
				this.addEventListener(evnetType, callback, false);
			});
		},

		off: function(eventType, callback) {
			return this.each(function() {
				this.removeEventListener(eventType, callback);
			});
		}
	});
	
	// 统一实现所有其他绑定事件的方法：
	cl.each(( 'blur focus focusin focusout load resize scroll unload click dblclick ' +
	'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
	'change select submit keydown keypress keyup error contextmenu' ).split( ' ' ), function(i, v) {
		// 注意：此处的 this 是字符串类型的包装对象，
		// 			 所以，需要使用参数 v
		cl.fn[v] = function( callback ) {
			return this.on(v, callback);
		};
	});
	
	// 类操作模块
	cl.fn.extend({
		css: function( name, value ) {
			if( arguments.length === 2 ) {
				return this.each(function() {
					this.style[name] = value;
				});
			}
			
			if( cl.isString(name) ) {
				if(window.getComputedStyle) {
					return  window.getComputedStyle(this.get(0))[name];
				} else {
					return this.get(0).currentStyle[name];
				}
			} else {
				return this.each(function() {
					var that = this;

					cl.each(name, function(key, v) {
						that.style[key] = v;
					});
				});
			}
		},
		
		hasClass: function( clsName ) {
			var flag = false;
			
			this.each(function() {
				if( (' ' + this.className + ' ').indexOf( ' ' + clsName + ' ') > -1 ) {
					flag = true;
					return false;
				}
			});

			return flag;
		},

		addClass: function( clsName ) {
			return this.each(function() {
				if( !cl(this).hasClass(clsName) ) {
					this.className = cl.trim( this.className + ' ' + clsName );
				}
			});
		},
		
		removeClass: function( clsName ) {
			return this.each(function() {
				var classStr = ' ' + this.className + ' ';
				while( classStr.indexOf(' ' + clsName + ' ') > -1 ) {
					classStr = classStr.replace(' ' + clsName + ' ', ' ');
				}

				this.className = cl.trim( classStr );
			});
		},

		toggleClass: function( clsName ) {

			return this.each(function() {
				var temp = cl(this);

				// 分别判断每一个元素有没有指定的类
				if( temp.hasClass(clsName) ) {
					temp.removeClass( clsName );
				} else {
					temp.addClass( clsName );
				}
			});
		}
	});
	
	// 属性操作模块
	cl.fn.extend({
		attr: function(name, value) {
			if( arguments.length === 2 ) {
				return this.each(function() {
					this.setAttribute(name, value);
				});
			}

			if( cl.isString(name) ) {
				// 读取
				return this.get(0).getAttribute(name);
			} else {
				// 设置多个属性
				return this.each(function() {
					var that = this;

					cl.each(name, function(k, v) {
						that.setAttribute(k, v);
					});
				});
			}
		},
		
		prop: function(name, value) {
			if( arguments.length === 2 ) {
				return this.each(function() {
					this[name] = value;
				});
			}

			if( cl.isString(name) ) {
				return this.get(0)[name];
			} else {
				return this.each(function() {
					var that = this;

					cl.each(name, function(k, v) {
						that[k] = v;
					});
				});
			}
		},

		text: function( txt ) {
			var ret = [];
			if( txt == null ) {
				this.each(function() {
					if(this.innerText) {
						ret.push( this.innerText );
					} else {
						ret.push( this.textContent );
					}
				});

				return ret.join('');
			}

			return this.each(function() {
				if( this.innerText ) {
					this.innerText = txt;
				} else {
					this.textContent = txt;
				}
			});
		},

		val: function( value ) {
			if( typeof value === 'undefined' ) {
				return this.get(0).value;
			}

			return this.each(function() {
				this.value = value;
			});
		},

		html: function( htmlString ) {
			if( typeof htmlString === 'undefined' ) {
				return this.get(0).innerHTML;
			}

			return this.each(function() {
				this.innerHTML = htmlString;
			});
		}
	});

	
	// 暴露 cl
	window.I = window.cl = cl;
})(window);