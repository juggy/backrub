(function() {
  Backbone.Template = {
    getPath: function(path, base) {
      var parts;
      base = base || window;
      if (!path) {
        throw "Path is undefined or null";
      }
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
          return new Handlebars.SafeString(this.span(fn(this.model)));
        };
        return view.render();
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
        _.bindAll(this, "render", "rerender", "span", "live", "value", "textAttributes");
        this.bbid = "bv-" + (jQuery.uuid++);
        return this.attr = this.options.attr;
      },
      value: function() {
        return Backbone.Template.resolveValue(this.attr, this.model);
      },
      textAttributes: function() {
        var attr;
        if (this.renderedAttributes) {
          return this.renderedAttributes;
        }
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
        return this.renderedAttributes = attr.join(" ");
      },
      span: function(inner) {
        return "<" + this.tagName + " " + (this.textAttributes()) + " data-bvid=\"" + this.bbid + "\">" + inner + "</" + this.tagName + ">";
      },
      rerender: function() {
        return this.live().replaceWith(this.render().string);
      },
      render: function() {
        return new Handlebars.SafeString(this.span(this.value()));
      }
    }),
    createView: function(viewProto, options) {
      var v;
      v = new viewProto(options);
      if (!v) {
        throw "Cannot instantiate view";
      }
      v.span = Backbone.Template._BindView.prototype.span;
      v.textAttributes = Backbone.Template._BindView.prototype.textAttributes;
      v.bbid = jQuery.uuid++;
      return v;
    }
  };
  Handlebars.registerHelper("view", function(viewName, context) {
    var v, view;
    view = Backbone.Template.getPath(viewName);
    v = Backbone.Template.createView(view, context.hash);
    v.render = function() {
      var rendered;
      rendered = this.span(context(this));
      this.trigger("rendered");
      return new Handlebars.SafeString(rendered);
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
  Handlebars.registerHelper("collection", function(attr, context) {
    var colAtts, colTagName, colView, colViewPath, collection, itemAtts, itemTagName, itemView, itemViewPath, item_view, options, setup, view, views;
    collection = Backbone.Template.resolveValue(attr, this);
    if (!(collection.each != null)) {
      throw "not a backbone collection!";
    }
    options = context.hash;
    colViewPath = options != null ? options.colView : void 0;
    if (colViewPath) {
      colView = Backbone.Template.getPath(colViewPath);
    }
    colTagName = (options != null ? options.colTag : void 0) || "ul";
    itemViewPath = options != null ? options.itemView : void 0;
    if (itemViewPath) {
      itemView = Backbone.Template.getPath(itemViewPath);
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
    view = colView ? Backbone.Template.createView(colView, {
      model: collection,
      attributes: colAtts,
      tagName: (options != null ? options.colTag : void 0) ? colTagName : colView.prototype.tagName
    }) : new Backbone.Template._BindView({
      tagName: colTagName,
      attributes: colAtts,
      attr: attr,
      model: this
    });
    views = {};
    item_view = function(m) {
      var mview;
      mview = itemView ? Backbone.Template.createView(itemView, {
        model: m,
        attributes: itemAtts,
        tagName: (options != null ? options.itemTag : void 0) ? itemTagName : itemView.prototype.tagName
      }) : new Backbone.Template._BindView({
        tagName: itemTagName,
        attributes: itemAtts,
        model: m
      });
      mview.render = function() {
        return this.span(context(this));
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
      views = {};
      setup(collection, view, views);
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
