;
! function() {
  var tlog = window.tlog || [];
  var body = document.getElementsByTagName('body')[0];
  var pageId = body.getAttribute('data-page-id') || '';
  var dataInfo = body.getAttribute('data-info') || '';
  // 不支持类似.com.cn 这种域名
  var domain = document.domain.split('.').slice(-2).join('.') + (location.port ? ':' + location.port : '');
  var __tlogPreSet = window.__tlogPreSet || {};
  var cookie = {
    get: function(name) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
          var ret;
          try {
            ret = decodeURIComponent(c.substring(nameEQ.length, c.length));
          } catch (e) {
            ret = unescape(c.substring(nameEQ.length, c.length));
          }
          return ret;
        }
      }
      return null;
    },
    set: function(name, value, days, path, domain, secure) {
      var expires;
      if (typeof days === 'number') {
        var date = new Date();
        date.setTime(date.getTime() + (days * 1000));
        expires = date.toGMTString();
      } else if (typeof days === 'string') {
        expires = days;
      } else {
        expires = false;
      }
      document.cookie = name + '=' + encodeURIComponent(value) +
        (expires ? (';expires=' + expires) : '') +
        (path ? (';path=' + path) : '') +
        (domain ? (';domain=' + domain) : '') +
        (secure ? ';secure' : '');
    }
  };
  var xmlHttp = function() {
    try {
      // Firefox, Opera 8.0+, Safari, Chrome
      return new XMLHttpRequest();
    } catch (e) {
      // IE 6.0+
      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch (e) {
        // IE 5.5+
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    }
  };
  tlog = {
    post: function() {
      var params = formatParams(this.params);
      var xhr = xmlHttp();

      xhr.withCredentials = true;
      xhr.open('POST', this.href, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(params);
      this.params = {
        page_id: pageId,
        data_info: dataInfo
      }

      function formatParams(data) {
        var arr = [];
        for (var i in data) {
          if (data.hasOwnProperty(i)) {
            arr.push(i + '=' + data[i]);
          }
        }
        return arr.join('&');
      }
    },
    pug: function() {
      if (!arguments || typeof arguments[0] != 'object') {
        return
      }
      var param = arguments[0],
        url = arguments[1] || window.location.href;
      url = url.split('#');
      var hash = url[1] || '';
      url = url[0];
      for (var i in param) {
        if (param.hasOwnProperty(i)) {
          var name = i,
            val = param[i];
          var reg = new RegExp('([\\?&#])((' + name + '=)([^&#]*))(&?)', 'i');
          var omatch = url.match(reg);
          // 更新 params
          this.params[name] = val;
          // 清除
          if (val !== 0 && !val && omatch) {
            (omatch[5] && omatch[2]) ? url = url.replace(omatch[2] + '&', ''): (omatch[1] && omatch[2]) ? url = url.replace(omatch[0], '') : ''
          }
          // 新增
          if ((val === 0 || val) && !omatch) {
            url.indexOf('?') > -1 ? url += '&' + name + '=' + val : url += '?' + name + '=' + val
          }
          // 更新
          if ((val === 0 || val) && omatch === 0 || omatch && val != omatch[4]) {
            url = url.replace(omatch[2], omatch[3] + val);
          }
        }
      }
      if (hash) {
        url += '#' + hash;
      }
      if (!arguments[1] && window.location.href != url) {
        window.location.href = url;
      } else {
        return url;
      }
    },
    gup: function(name, url) {
      var reg = new RegExp('[?&#]' + name + '=([^&#]+)', 'i'),
        ret = reg.exec(url);
      return ret ? decodeURIComponent(ret[1]) : '';
    },
    stacks: Object.prototype.toString.call(tlog) === '[object Array]' ? tlog : [],
    start: +new Date(),
    cache: {
      url: encodeURIComponent(window.location.href),
      refer: encodeURIComponent(window.document.referrer),
      resolution: window.screen ? window.screen.width + 'X' + window.screen.height : '0X0'
    },
    href: '//statistic.' + domain + '/statisticPlatform/tLog',
    src: '//statistic.' + domain + '/statisticPlatform/tLog?page_id=' + pageId + (dataInfo ? '&data_info=' + dataInfo : ''),
    params: {
      page_id: pageId,
      data_info: dataInfo
    },
    timer: '',
    mscid: {},
    domain: domain,
    path: '/',
    defaultcode: '00000000',
    getTime: function() {
      return +new Date();
    },
    load: function(source) {
      var src = this.pug({
        t: this.getTime()
      }, source);
      // IE 10以下兼容
      if (navigator.appName === 'Microsoft Internet Explorer' && parseInt(navigator.appVersion.split(';')[1].replace(/[ ]/g, '').replace('MSIE', '')) < 10) {
        var image = new Image;
        image.src = src;
      } else {
        this.post()
      }
    },
    uid: function() {
      return (+new Date() + Math.random()).toFixed(2);
    },
    toToday: function() {
      var date = new Date();
      date.setHours(0, 0, 0, 0);
      return 24 * 60 * 60 * 1000 - (this.getTime() - date.getTime());
    },
    getTlog: function() {
      return cookie.get('__tlog') || '';
    },
    update: function() {
      var __tlog = this.getTlog(),
        url = window.location.href;
      if (!__tlog) {
        this.defaultSet('update');
        return;
      } else {
        var tmp = __tlog.split('|'),
          n_imscid = this.gup('imscid', url),
          n_mscid = this.gup('mscid', url),
          sessionId = tmp[0],
          if_mscid = tmp[1],
          il_mscid = tmp[2],
          ef_mscid = tmp[3],
          el_mscid = tmp[4];
        if (n_imscid && (il_mscid !== n_imscid)) {
          il_mscid = n_imscid;
        }
        if (n_mscid && (ef_mscid !== n_mscid)) {
          el_mscid = n_mscid;
        }
        cookie.set('__tlog', [sessionId, if_mscid, il_mscid, ef_mscid, el_mscid].join('|'), this.timer, this.path, this.domain);
        this.mscid = {
          sessionId: sessionId,
          if_mscid: if_mscid,
          il_mscid: il_mscid,
          ef_mscid: ef_mscid,
          el_mscid: el_mscid
        };
      };
    },
    defaultSet: function(update) {
      var sessionId = this.uid(),
        url = window.location.href,
        defaultcode = this.defaultcode,
        if_mscid = update ? this.gup('imscid', url) || defaultcode : defaultcode,
        il_mscid = if_mscid,
        ef_mscid = update ? this.gup('mscid', url) || this.defaultcode : defaultcode,
        el_mscid = ef_mscid;
      cookie.set('__tlog', [sessionId, if_mscid, il_mscid, ef_mscid, el_mscid].join('|'), this.timer, this.path, this.domain);
      this.mscid = {
        sessionId: sessionId,
        if_mscid: if_mscid,
        il_mscid: il_mscid,
        ef_mscid: ef_mscid,
        el_mscid: el_mscid
      }
    },
    push: function() {
      if (!arguments.length) {
        return;
      };
      if (!this.getTlog()) {
        this.defaultSet('update');
      }
      if (this.isnew) {
        this.src = this.pug({
          'isnew': 1
        }, this.src);
        delete this.isnew;
      } else {
        this.src = this.pug({
          'isnew': ''
        }, this.src);
      };
      var user_id = cookie.get('user_id') || 0,
        user_kind = cookie.get('user_kind') || 9,
        __session_seq = cookie.get('__session_seq') || 0,
        __uv_seq = cookie.get('__uv_seq') || 0;
      var param = arguments[0].split(':'),
        type = param[0],
        arr = (param[1] || '').split('&'),
        id = arr[0],
        adds = arr.slice(1),
        src = this.pug(this.cache, this.src),
        obj = {},
        add_obj = {};
      src = this.pug(this.mscid, src);

      for (var i in adds) {
        if (adds.hasOwnProperty(i) && adds[i].indexOf('=') > -1 && adds[i].indexOf('=') === adds[i].lastIndexOf('=')) {
          var add = adds[i].split('=');
          add_obj[add[0]] = add[1];
        }
      }
      src = this.pug(add_obj, src);

      switch (type) {
        case 'p':
          __session_seq = __session_seq - 0 + 1;
          __uv_seq = __uv_seq - 0 + 1;
          cookie.set('__session_seq', __session_seq, this.timer, this.path, this.domain);
          cookie.set('__uv_seq', __uv_seq, Math.round(this.toToday() / 1000), this.path, this.domain);
          obj.type = 'p';
          // push p 类型支持
          id && (obj.page_id = id);
          break;
        case 'c':
          obj = {
            c_id: id,
            type: 'c'
          };
          break;
        case 's':
          obj = {
            s_id: id,
            type: 's'
          };
          break;
        default: //'v'
          obj = {
            v_stay_time: this.getTime() - this.start,
            type: 'v'
          };
          break;
      }
      src = this.pug(obj, src);
      src = this.pug({
        user_id: user_id,
        user_kind: user_kind,
        session_seq: __session_seq,
        uv_seq: __uv_seq
      }, src);
      this.load(src);
    },
    init: function() {
      var __uuid = cookie.get('__uuid');
      var __nnn_bad_na_ = cookie.get('__nnn_bad_na_');
      if (__nnn_bad_na_) {
        this.src = this.pug({
          __nnn_bad_na_: __nnn_bad_na_
        }, this.src);
      }
      this.src = this.pug(__tlogPreSet, this.src);
      if (!__uuid) {
        __uuid = this.uid();
        cookie.set('__uuid', __uuid, 60 * 60 * 24 * 365 * 20, this.path, this.domain);
        this.isnew = 1;
      };
      this.cache.uuid = __uuid;
      this.update();
      var otherOnbeforeunloadFn = window.onbeforeunload;
      window.onbeforeunload = function() {
        tlog.push('v');
        if(typeof otherOnbeforeunloadFn === 'function') otherOnbeforeunloadFn();
      }
      var arr = this.stacks;
      this.push('p');
      for (var i = 0, l = arr.length; i < l; i++) {
        this.push(arr[i]);
      };
    }
  };
  tlog.init();
  window.tlog = tlog;
}();
