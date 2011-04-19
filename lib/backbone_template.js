(function() {
  Backbone.Template = {
    getPath: function(path, base) {
      var parts;
      base = base || window;
      parts = path.split(".");
      _.each(parts, function(p) {
        base = base[p];
        if (!base) {
          throw "cannot find given path '" + path + "'";
          return {};
        }
      });
      return base;
    },
    resolveValue: function(attr, model) {
      var model_info, value;
      model_info = Backbone.Template.resolveIsModel(attr, model);
      value = (function() {
        try {
          return Backbone.Template.getPath(model_info.attr, model_info.model);
        } catch (error) {
          return null;
        }
      })();
      if (model_info.is_model) {
        return model_info.model.get(model_info.attr);
      } else if (typeof value === "function") {
        return value();
      } else {
        return value;
      }
    },
    resolveIsModel: function(attr, model) {
      var is_model;
      is_model = false;
      attr = attr.charAt(0) === "@" ? (is_model = true, model = model.model, attr.substring(1)) : attr;
      return {
        is_model: is_model,
        attr: attr,
        model: model
      };
    },
    bindIf: function(attr, context) {
      var model_info, view;
      if (context) {
        view = new Backbone.Template._BindView({
          attr: attr,
          model: this
        });
        model_info = Backbone.Template.resolveIsModel(attr, this);
        model_info.model.bind("change:" + model_info.attr, view.rerender);
        view.render = function() {
          var fn;
          fn = Backbone.Template.resolveValue(this.attr, this.model) ? context : context.inverse;
          return this.span(fn(this.model));
        };
        return new Handlebars.SafeString(view.render());
      } else {
        throw "No block is provided!";
      }
    },
    _BindView: Backbone.View.extend({
      tagName: "span",
      live: function() {
        return $("[data-bvid='" + this.bbid + "']");
      },
      initialize: function() {
        _.bindAll(this, "render", "rerender");
        this.bbid = "bv-" + (jQuery.uuid++);
        return this.attr = this.options.attr;
      },
      value: function() {
        return Backbone.Template.resolveValue(this.attr, this.model);
      },
      span: function(inner) {
        return "<span data-bvid=\"" + this.bbid + "\">" + inner + "</span>";
      },
      rerender: function() {
        return this.live().replaceWith(this.render());
      },
      render: function() {
        return this.span(this.value());
      }
    })
  };
  Handlebars.registerHelper("view", function(viewName, context) {
    var v, view;
    view = Backbone.Template.getPath(viewName);
    v = new view(context.hash);
    v.render = function() {
      var rendered;
      rendered = context(this);
      this.trigger("rendered");
      return rendered;
    };
    return v.render(v);
  });
  Handlebars.registerHelper("bind", function(attrName, context) {
    var model_info, view;
    view = new Backbone.Template._BindView({
      attr: attrName,
      model: this
    });
    model_info = Backbone.Template.resolveIsModel(attrName, this);
    model_info.model.bind("change:" + model_info.attr, view.rerender);
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
      model_info = Backbone.Template.resolveIsModel(attr, self);
      value = Backbone.Template.resolveValue(attr, self);
      outAttrs.push("" + k + "=\"" + value + "\"");
      return model_info.model.bind("change:" + model_info.attr, function() {
        var el;
        el = $("[data-baid='ba-" + id + "']");
        if (el.length === 0) {
          return model_info.model.unbind("change" + model_info.attr);
        } else {
          return el.attr(k, Backbone.Template.resolveValue(attr, self));
        }
      });
    });
    outAttrs.push("data-baid=\"ba-" + id + "\"");
    return new Handlebars.SafeString(outAttrs.join(" "));
  });
  Handlebars.registerHelper("boundIf", function(attr, context) {
    return _.bind(Backbone.Template.bindIf, this)(attr, context);
  });
  Handlebars.registerHelper("boundUnless", function(attr, context) {
    var fn;
    fn = context;
    context = context.inverse;
    context.inverse = fn;
    return _.bind(Backbone.Template.bindIf, this)(attr, context);
  });
  Handlebars.registerHelper("boundEach", function(attr, context) {
    var collection, item_view, setup, view, views;
    collection = Backbone.Template.resolveValue(attr, this);
    if (!(collection.each != null)) {
      throw "not a backbone collection!";
    }
    view = new Backbone.Template._BindView({
      attr: attr,
      model: this
    });
    views = {};
    item_view = function(m) {
      var mview;
      mview = new Backbone.Template._BindView({
        model: m
      });
      mview.render = function() {
        return this.span(context(this));
      };
      return mview;
    };
    setup = function(c) {
      collection.each(function(m) {
        var mview;
        mview = item_view(m);
        return views[m.cid] = mview;
      });
      return view.render = function() {
        var rendered;
        rendered = _.map(views, function(v) {
          return v.render();
        });
        return new Handlebars.SafeString(this.span(rendered.join("\n")));
      };
    };
    setup(collection);
    collection.bind("refresh", function() {
      views = {};
      setup(collection);
      return view.rerender();
    });
    collection.bind("add", function(m) {
      var mview;
      mview = item_view(m);
      views[m.cid] = mview;
      return view.live().append(mview.render());
    });
    collection.bind("remove", function(m) {
      var mview;
      mview = views[m.cid];
      return mview.live().remove();
    });
    return view.render();
  });
}).call(this);
