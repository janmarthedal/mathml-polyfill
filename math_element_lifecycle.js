window.MathElementLifecycle = {};

(function (scope) {
    'use strict';

    var MML = "http://www.w3.org/1998/Math/MathML",
        observerConfig = {childList: true, subtree: true},
        hooks, observer;

    function searchTree(node, visitor) {
        if (node.localName == 'math' && node.namespaceURI == MML) {
            visitor(node);
            return;  // don't recurse into <math> element
        }
        node = node.firstElementChild;
        while (node) {
            searchTree(node, visitor);
            node = node.nextElementSibling;
        }
    }

    function create(node) {
        if (!node.__hooked__) {
            node.__hooked__ = true;
            if (hooks.created) {
                hooks.created(node);
            }
        }
    }

    function attach(node) {
        if (!node.__attached__) {
            create(node);
            node.__attached__ = true;
            if (hooks.attached) {
                hooks.attached(node);
            }
        }
    }

    function detach(node) {
        if (node.__attached__) {
            delete node.__attached__;
            if (hooks.detached) {
                hooks.detached(node);
            }
        }
    }

    function observeHandler(mutations) {
        mutations.forEach(function (mutation) {
            //console.log(mutation);
            if (mutation.removedNodes) {
                Array.prototype.forEach.call(mutation.removedNodes, function (node) {
                    searchTree(node, detach);
                });
            }
            if (mutation.addedNodes) {
                Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                    searchTree(node, attach);
                });
            }
        });
    }

    function createWrapper(obj, methodName) {
        var orig = obj[methodName];
        obj[methodName] = function () {
            var node = orig.apply(this, arguments);
            searchTree(node, create);
            return node;
        }
    }

    function domReady() {
        var body = document.querySelector('body');
        // Wrap DOM API
        createWrapper(document, 'createElementNS');
        createWrapper(Node.prototype, 'cloneNode');
        // Call created+attached on existing <math> nodes
        searchTree(body, attach);
        // Listen for node additions and removals in entire body
        observer = new MutationObserver(observeHandler);
        observer.observe(body, observerConfig);
    }

    scope.register = function (_hooks) {
        if (!_hooks) {
            throw new Error('MathElementLifecycle.register: first argument `hooks` must not be empty');
        }
        if (hooks) {
            throw new Error('MathElementLifecycle.register: already registered');
        }
        hooks = _hooks;
        if (document.readyState == 'complete') {
            domReady();
        } else if (document.readyState == 'interactive' && !window.attachEvent) {
            domReady();
        } else {
            document.addEventListener('DOMContentLoaded', domReady);
        }
    };
    scope.MML = MML;

})(window.MathElementLifecycle);
