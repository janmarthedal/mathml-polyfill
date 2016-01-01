(function () {

    window.MathElementHooks.register({
        created: function (node) {
            console.log('created', node);
        },
        attached: function (node) {
            console.log('attached', node);
        },
        detached: function (node) {
            console.log('detached', node);
        }
    });

    window.onload = function () {
        var e = document.createElementNS(window.MathElementHooks.MML, 'math');
        document.body.appendChild(e);

        e = document.createElement('div');
        e.innerHTML = '<span><math display="inline"><mi>x</mi></math></span>';
        document.body.appendChild(e);
    }

})();
