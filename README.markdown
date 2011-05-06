# What is Backrub

Backrub is Handlebars {{templates}} beautifully integrated into Backbone Views. The main inspiration for the project is the use of Handlebars to power the new TemplateView in SproutCore.

The goal is to define your page structure entirely in Backrub and let the template create instance of your different Backbone Views. Pretty similar to how you would build an ERB template on Rails and other backend frameworks. You can have if statements, loops and use data from objects. The magic behind this is that the different elements of your template will update automatically upon change by listening to Backbone "change:*" events. 

For example: your if statement depends on the "done" value of you model; when "done" changes the if will be reevaluated and if needed rerendered on the page for your. All the bindings will be done for you.

# Install

Drop the **lib/backbone_template.js** into you javascript folder, include it on your page and you are ready to go!

## Dev install

If you want to fork this project and add awesome stuff to it you will need to install:

* coffeescript
* cake
* docco

To build the coffeescripts to javascripts use the "cake build" command and to continuously build it use the "cake watch" command. To build the documentation use the "cake doc" command.

# How to use

* For general Handlebars documentation, please refer to http://handlebars.strobeapp.com/
* For general Backbone documentation, please refer to http://documentcloud.github.com/backbone/

The easiest way to load a template is to use Backbone.TemplateView. It takes care of all the details for you and acts like your typical Backbone.View. You can even extend it to add your own personal touch.

    var view = Backbone.TemplateView({model: myModel, template: '{{#view "SimpleView" model=model}}{{attribute_1}}{{/view}}' });
    $("body").append(view.render());
    
If you extend the TemplateView, you can specify the _template_ attribute. You might want to change this behaviour and load the template from URL and showing a loading panel to your user.

Otherwise you can load the template directly within your existing views, render it and make it alive (more on that later):

    var template = new Backbone.Backrub( '{{#view "SimpleView" model=model}}{{attribute_1}}{{/view}}' );
    $("body").append( template.render({model: new Backbone.Model}) );
    template.makeAlive();
    
And check out the complete todo example: https://github.com/juggy/backbone-template-todos
It is the same as the classic Backbone example.

## Things to know

**Events**

When the template is rendering, the different parts will be listening for Backbone events on the different attributes. The events have the _change:attributeName_ form. In Backbone, those events are only sent when a value changes on a Model. When you bind a view attribute or function, you will have to trigger those change events yourself. If your _doneClass_ function on the view depends on the _model.done_ value, you should trigger a _change:doneClass_ on your view whenever a _change:done_ occurs on the model.

**Dependable**

To somewhat help with the eventing problem, I created a dependency definition:

    this.Model = Backbone.Model.extend({
      initialize: function(){
        this.dependencies({ "composed change:attribute_1 change:attribute_2" : ""});
      },
      composed : function(){ return this.get("attribute_1") + this.get("attribute_2")}
    });
    
You define the dependencies using an object of {"attribute event" : base_object}. If the base is the current object use an empty string. 

**Context**
Handlebars has a concept of context. Each element lives within one. In the case of Backrub this context is always a Backbone View. You access data in this context. 

**Data resolution**
Backrub will always set the model attribute on your View when. To access the model attributes you can either use the attribute name directly and the template will determine if it is a model attribute first and if not it will fallback on the context attribute. If you want to force the template to look into the model give it a string starting with @ like "@content". This will mark that attribute as a model attribute and nothing more.

Example:

The context is the following

* View
  * model
    * attribute_1
  * todoClass : function ...
  * todoValue : string
  
If you use a template like this:

    <div>{{todoClass}}</div>
    
Backrub will first look at the model attributes, then the view attributes. It will find todoClass and will check if it is a function and will execute it if needed.

**Element and attributes created**
Bind and if/unless helpers will create a new _span_ element to be able to refresh that particular document section. 

BindAttr will create, along with the attributes given, a new attribute (data-baid) to be able to change the attributes as needed.

Collection will create a _ul_ container by default with _li_ items. You can change that as you want, see the doc for collection below.

You can always change those attributes (on if/unless, bind, view and collection) by passing a Handlebars hash. Like so:

    {{bind data tagName="div" class="important-data" id="uniqueId"}}
    
This will create a _div_ element with class _important-data_ and the id will be generated by the uniqueId function of the current context. The same binding and refreshing behaviour found in _bindAttr_ is used.

## bind

It's called _bind_ but you really have nothing to do to benefits it. If you create a mustache with referencing an attribute like so {{attribute_name}} you used _bind_ . You can also call it directly using {{bind some_attribute}} or {{ bind "@model_attr"}} but either way that is all there is to it. A _span_ will be created and Backbone Events "change:attribute_name" will be listened to refresh the attribute as needed.

**Example:**

    <div class="todo">{{content}}</div>

Will give

    <div class="todo">my content</div>

## bindAttr

_bindAttr_ is used to create data-bound HTML attributes (id, class, etc.). It will create a _data-baid_ attribute to retrive the element when it needs update.

**Example:**

    <div {{bindAttr class=todoClass}}>{{content}}</div>

Will give

    <div class="todo">my content</div>

## if/unless

You can use if/unless/else on any single data-binding. You cannot do a check within the template. The data bound to the template must evaluate to true or false. It can be a model attribute, a context attribute, a function attribute or a path within the context.

## view

Creating a template is nice, but you need to react to events on it and add logic. This is where the _view_ helper comes in handy. You specify a Backbone.View for a part of your template and Backrub will instantiate it as needed. 

Some function will be added to the view (mainly: span, rerender and live). Render will be completely changed to handle the template. Backrub will use the id, className, tagName and attributes you have specified on your view to create it in the DOM.

When you use _view_ make sure that when you actually append your template result (a string really) to your DOM, to call makeAlive to make sure all events are delegated properly by Backbone.

**Example**

    <div class="header">{{#view "MyApp.AutocompleteView" model=model}}<input type="text" />{{/view}}</div>

## collection

The _collection_ helper is there to iterate over a Backbone.Collection. It will listen for add, remove and refresh events to update the template accordingly. 

The first argument is the path pointing to the collection within the current context. The other arguments take the form of a hash. They are used to define the main collection container (the _ul_ tag in a list) and the item container (the _li_):

* colTag: The tagName of the container element
* colView : The view to use for the container element
* col* : Any HTML attribute for the container element (won't be bounded for now)
* itemTag: The tagName of the item element
* itemView : The view to use for the item element
* item* : Any HTML attribute for the item element (won't be bounded for now)

Anything within the _collection_ helper will be used for the item template.

Currently there is nothing to handle sorting. Send me a patch!

**Example**

    <div id="todos"
      {{#collection model colTag="ul" colId="todo-list" itemView="TodoView"}}
        {{#if done}}
          <input type='checkbox' class='todo-check' checked="checked" />
        {{else}}
          <input type='checkbox' class='todo-check'/>
        {{/if}}
        <div class='todo-content'>{{content}}</div>
        <span class='todo-destroy'></span>
        <input type='text' class='todo-input' {{bindAttr value=content}}/>
      {{/collection}}
    </div>

# License (MIT)

Copyright (c) 2010 Julien Guimont <julien.guimont@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Special thanks

* Yehuda Katz