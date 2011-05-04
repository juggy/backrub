var Template, proto, _i, _len, _ref;
Template = {
  _Genuine: {
    nameLookup: Handlebars.JavaScriptCompiler.prototype.nameLookup,
    mustache: Handlebars.Compiler.prototype.mustache
  },
  _getPath: function(path, base, wrap) {
    var parts, prev;
    wrap = wrap || false;
    base = base || window;
    prev = base;
    if (path === null || path === void 0) {
      throw new Error("Path is undefined or null");
    }
    parts = path.split(".");
    _.each(parts, function(p) {
      prev = base;
      base = p === "" ? base : base[p];
      if (!base) {
        throw new Error("cannot find given path '" + path + "'");
        return {};
      }
    });
    if (typeof base === "function" && wrap) {
      return _.bind(base, prev);
    } else {
      return base;
    }
  },
  _resolveValue: function(attr, model) {
    var model_info, value;
    model_info = Template._resolveIsModel(attr, model);
    value = (function() {
      try {
        return Template._getPath(model_info.attr, model_info.model, true);
      } catch (error) {

      }
    })();
    if (model_info.is_model) {
      return model_info.model.get(model_info.attr);
    } else if (typeof value === "function") {
      return value();
    } else {
      return value || "";
    }
  },
  _resolveIsModel: function(attr, model) {
    var is_model;
    is_model = false;
    attr = attr && ((typeof attr.charAt == "function" ? attr.charAt(0) : void 0) === "@") ? (is_model = true, model = model.model, attr.substring(1)) : attr && model.model && model.model.get(attr) !== void 0 ? (is_model = true, model = model.model, attr) : attr;
    return {
      is_model: is_model,
      attr: attr,
      model: model
    };
  },
  _bindIf: function(attr, context) {
    var model_info, view;
    if (context) {
      view = new Template._BindView({
        attr: attr,
        model: this
      });
      context.data.exec.addView(view);
      model_info = Template._resolveIsModel(attr, this);
      model_info.model.bind("change:" + model_info.attr, function() {
        if (context.data.exec.isAlive()) {
          view.rerender();
          return context.data.exec.makeAlive();
        }
      });
      view.render = function() {
        var fn;
        fn = Template._resolveValue(this.attr, this.model) ? context.fn : context.inverse;
        return new Handlebars.SafeString(this.span(fn(this.model, {
          data: context.data
        })));
      };
      return view.render();
    } else {
      throw new Error("No block is provided!");
    }
  },
  _createView: function(viewProto, options) {
    var v;
    v = new viewProto(options);
    if (!v) {
      throw new Error("Cannot instantiate view");
    }
    v.span = Template._BindView.prototype.span;
    v.live = Template._BindView.prototype.live;
    v.textAttributes = Template._BindView.prototype.textAttributes;
    v.bvid = "bv-" + (jQuery.uuid++);
    return v;
  },
  _BindView: Backbone.View.extend({
    tagName: "span",
    live: function() {
      return $("[data-bvid='" + this.bvid + "']");
    },
    initialize: function() {
      _.bindAll(this, "render", "rerender", "span", "live", "value", "textAttributes");
      this.bvid = "bv-" + (jQuery.uuid++);
      return this.attr = this.options.attr;
    },
    value: function() {
      return Template._resolveValue(this.attr, this.model);
    },
    textAttributes: function() {
      var attr;
      this.attributes = this.attributes || this.options.attributes || {};
      if (!this.attributes.id && this.id) {
        this.attributes.id = this.id;
      }
      if (!this.attributes["class"] && this.className) {
        this.attributes["class"] = this.className;
      }
      attr = _.map(this.attributes, function(v, k) {
        return "" + k + "=\"" + v + "\"";
      });
      return attr.join(" ");
    },
    span: function(inner) {
      return "<" + this.tagName + " " + (this.textAttributes()) + " data-bvid=\"" + this.bvid + "\">" + inner + "</" + this.tagName + ">";
    },
    rerender: function() {
      return this.live().replaceWith(this.render().string);
    },
    render: function() {
      return new Handlebars.SafeString(this.span(this.value()));
    }
  })
};
Handlebars.Compiler.prototype.mustache = function(mustache) {
  var id;
  if (mustache.params.length || mustache.hash) {
    return Template._Genuine.mustache.call(this, mustache);
  } else {
    id = new Handlebars.AST.IdNode(['bind']);
    mustache.id.string = "@" + mustache.id.string;
    mustache = new Handlebars.AST.MustacheNode([id].concat([mustache.id]), mustache.hash, !mustache.escaped);
    return Template._Genuine.mustache.call(this, mustache);
  }
};
Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name, type) {
  if (type === 'context') {
    return "(context.model && context.model.get(\"" + name + "\") != null ? \"@" + name + "\" : \"" + name + "\");";
  } else {
    return Template._Genuine.nameLookup.call(this, parent, name, type);
  }
};
Backbone.dependencies = function(base, onHash) {
  var event, path, setupEvent, _results;
  if (!base.trigger && !base.bind) {
    throw new Error("Not a Backbone.Event object");
  }
  setupEvent = function(event, path) {
    var attr, e, object, parts, _i, _len, _ref, _results;
    parts = event.split(" ");
    attr = parts[0];
    object = Template._getPath(path, base);
    _ref = parts.slice(1);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      _results.push(object != null ? object.bind(e, function() {
        return base.trigger("change:" + attr);
      }) : void 0);
    }
    return _results;
  };
  _results = [];
  for (event in onHash) {
    path = onHash[event];
    _results.push(setupEvent(event, path));
  }
  return _results;
};
_ref = [Backbone.Model.prototype, Backbone.Controller.prototype, Backbone.Collection.prototype, Backbone.View.prototype];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  proto = _ref[_i];
  _.extend(proto, {
    dependencies: Backbone.dependencies
  });
}
Backbone.Template = function(template) {
  _.bindAll(this, "addView", "render", "makeAlive", "isAlive");
  this.compiled = Handlebars.compile(template, {
    data: true,
    stringParams: true
  });
  this._createdViews = {};
  this._aliveViews = {};
  this._alive = false;
  return this;
};
_.extend(Backbone.Template.prototype, {
  render: function(options) {
    var self;
    self = this;
    return this.compiled(options, {
      data: {
        exec: this
      }
    });
  },
  makeAlive: function(base) {
    var currentViews, query, self;
    base = base || $("body");
    query = [];
    currentViews = this._createdViews;
    this._createdViews = {};
    _.each(currentViews, function(view, bvid) {
      return query.push("[data-bvid='" + bvid + "']");
    });
    this._alive = true;
    self = this;
    $(query.join(","), base).each(function() {
      var el, view, _ref;
      el = $(this);
      view = currentViews[el.attr("data-bvid")];
      view.el = el;
      view.delegateEvents();
      return (_ref = view.alive) != null ? _ref.call(view) : void 0;
    });
    return _.extend(this._aliveViews, currentViews);
  },
  isAlive: function() {
    return this._alive;
  },
  addView: function(view) {
    return this._createdViews[view.bvid] = view;
  },
  removeView: function(view) {
    delete this._createdViews[view.bvid];
    delete this._aliveViews[view.bvid];
    return delete view;
  }
});
Backbone.TemplateView = Backbone.View.extend({
  initialize: function(options) {
    this.template = this.template || options.template;
    if (!this.template) {
      throw new Error("Template is missing");
    }
    return this.compile = new Backbone.Template(this.template);
  },
  render: function() {
    try {
      $(this.el).html(this.compile.render(this));
      this.compile.makeAlive(this.el);
    } catch (e) {
      console.error(e.stack);
    }
    return this.el;
  }
});
Handlebars.registerHelper("view", function(viewName, context) {
  var execContext, key, resolvedOptions, v, val, view, _ref;
  execContext = context.data.exec;
  view = Template._getPath(viewName);
  resolvedOptions = {};
  _ref = context.hash;
  for (key in _ref) {
    val = _ref[key];
    resolvedOptions[key] = Template._resolveValue(val, this) || val;
  }
  v = Template._createView(view, resolvedOptions);
  execContext.addView(v);
  v.render = function() {
    return new Handlebars.SafeString(this.span(context(this, {
      data: context.data
    })));
  };
  return v.render(v);
});
Handlebars.registerHelper("bind", function(attrName, context) {
  var execContext, model_info, view;
  execContext = context.data.exec;
  view = new Template._BindView({
    attr: attrName,
    model: this
  });
  if (context.hash) {
    view.tagName = context.hash.tag || view.tagName;
    delete context.hash.tag;
    view.attributes = context.hash;
  }
  execContext.addView(view);
  model_info = Template._resolveIsModel(attrName, this);
  model_info.model.bind("change:" + model_info.attr, function() {
    if (execContext.isAlive()) {
      view.rerender();
      return execContext.makeAlive();
    }
  });
  return new Handlebars.SafeString(view.render());
});
Handlebars.registerHelper("bindAttr", function(context) {
  var attrs, id, outAttrs, self;
  attrs = context.hash;
  id = jQuery.uuid++;
  outAttrs = [];
  self = this;
  _.each(attrs, function(v, k) {
    var attr, model_info, value;
    attr = v;
    model_info = Template._resolveIsModel(attr, self);
    value = Template._resolveValue(attr, self);
    outAttrs.push("" + k + "=\"" + value + "\"");
    return model_info.model.bind("change:" + model_info.attr, function() {
      var el;
      if (context.data.exec.isAlive()) {
        el = $("[data-baid='ba-" + id + "']");
        if (el.length === 0) {
          return model_info.model.unbind("change" + model_info.attr);
        } else {
          return el.attr(k, Template._resolveValue(attr, self));
        }
      }
    });
  });
  outAttrs.push("data-baid=\"ba-" + id + "\"");
  return new Handlebars.SafeString(outAttrs.join(" "));
});
Handlebars.registerHelper("if", function(attr, context) {
  return _.bind(Template._bindIf, this)(attr, context);
});
Handlebars.registerHelper("unless", function(attr, context) {
  var fn, inverse;
  fn = context.fn;
  inverse = context.inverse;
  context.fn = inverse;
  context.inverse = fn;
  return _.bind(Template._bindIf, this)(attr, context);
});
Handlebars.registerHelper("collection", function(attr, context) {
  var colAtts, colTagName, colView, colViewPath, collection, execContext, itemAtts, itemTagName, itemView, itemViewPath, item_view, options, setup, view, views;
  execContext = context.data.exec;
  collection = Template._resolveValue(attr, this);
  if (!(collection.each != null)) {
    throw new Error("not a backbone collection!");
  }
  options = context.hash;
  colViewPath = options != null ? options.colView : void 0;
  if (colViewPath) {
    colView = Template._getPath(colViewPath);
  }
  colTagName = (options != null ? options.colTag : void 0) || "ul";
  itemViewPath = options != null ? options.itemView : void 0;
  if (itemViewPath) {
    itemView = Template._getPath(itemViewPath);
  }
  itemTagName = (options != null ? options.itemTag : void 0) || "li";
  colAtts = {};
  itemAtts = {};
  _.each(options, function(v, k) {
    if (k.indexOf("Tag") > 0 || k.indexOf("View") > 0) {
      return;
    }
    if (k.indexOf("col") === 0) {
      return colAtts[k.substring(3).toLowerCase()] = v;
    } else if (k.indexOf("item") === 0) {
      return itemAtts[k.substring(4).toLowerCase()] = v;
    }
  });
  view = colView ? Template._createView(colView, {
    model: collection,
    attributes: colAtts,
    tagName: (options != null ? options.colTag : void 0) ? colTagName : colView.prototype.tagName
  }) : new Template._BindView({
    tagName: colTagName,
    attributes: colAtts,
    attr: attr,
    model: this
  });
  execContext.addView(view);
  views = {};
  item_view = function(m) {
    var mview;
    mview = itemView ? Template._createView(itemView, {
      model: m,
      attributes: itemAtts,
      tagName: (options != null ? options.itemTag : void 0) ? itemTagName : itemView.prototype.tagName
    }) : new Template._BindView({
      tagName: itemTagName,
      attributes: itemAtts,
      model: m
    });
    execContext.addView(mview);
    mview.render = function() {
      return this.span(context(this, {
        data: context.data
      }));
    };
    return mview;
  };
  setup = function(col, mainView, childViews) {
    col.each(function(m) {
      var mview;
      mview = item_view(m);
      return childViews[m.cid] = mview;
    });
    return mainView.render = function() {
      var rendered;
      rendered = _.map(childViews, function(v) {
        return v.render();
      });
      return new Handlebars.SafeString(this.span(rendered.join("\n")));
    };
  };
  setup(collection, view, views);
  collection.bind("refresh", function() {
    if (execContext.isAlive()) {
      views = {};
      setup(collection, view, views);
      view.rerender();
      return execContext.makeAlive();
    }
  });
  collection.bind("add", function(m) {
    var mview;
    if (execContext.isAlive()) {
      mview = item_view(m);
      views[m.cid] = mview;
      view.live().append(mview.render());
      return execContext.makeAlive();
    }
  });
  collection.bind("remove", function(m) {
    var mview;
    if (execContext.isAlive()) {
      mview = views[m.cid];
      mview.live().remove();
      return execContext.removeView(mview);
    }
  });
  return view.render();
});