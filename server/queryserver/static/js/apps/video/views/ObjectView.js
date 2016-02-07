define(function (require) {
    var Backbone = require('Backbone');

    var ObjectView = Backbone.View.extend({
        tagName: 'div',

        template: require('hbs!./../templates/ObjectView'),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return ObjectView;
});