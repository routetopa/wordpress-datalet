(function() {
    tinymce.create('tinymce.plugins.RouteToPa', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function( ed, url ) {
            ed.addButton( 'datalet', {
                title : 'Insert a Datalet',
                cmd : 'datalet',
                icon: 'datalet'
            }); // addButton datalet

            ed.addCommand('datalet', function() {
                var code = prompt( "Paste the HTML code of the datalet here:");
                if ( code === null || code == '' ) {
                    return;
                }

                var scripts = [];
                var imports = [];
                var datalets = [];

                var dom = document.createElement( 'div' );
                dom.innerHTML = code;
                for ( i = 0; i < dom.children.length; i++ ) {
                    var node = dom.children[ i ];
                    if ( 'SCRIPT' == node.nodeName ) {
                        // Don't include commons scripts: the plugin will automatically add them
                        if ( node.getAttribute( 'src' ).indexOf( 'webcomponents-lite' ) >= 0 ) continue;
                        if ( node.getAttribute( 'src' ).indexOf( 'jquery-' ) >= 0 ) continue;
                        // Other scripts
                        scripts.push( node.getAttribute( 'src' ) );
                    } else if ( 'LINK' == node.nodeName && 'import' == node.getAttribute( 'rel' ) ) {
                        // Webcomponent definitions
                        imports.push( node.getAttribute( 'href' ) );
                    } else if ( node.nodeName.endsWith( '-DATALET' ) ) {
                        // Webcomponent element
                        datalets.push( node.outerHTML );
                    }
                }

                // Output the shortcode
                var output = '[datalet';
                if ( scripts.length > 0 ) {
                    output += ' script="' + scripts.join( '|' ) + '"';
                }
                if ( imports.length > 0 ) {
                    output += ' import="' + imports.join( '|' ) + '"';
                }
                output += ']';
                output += datalets.join( '' );
                output += '[/datalet]';
                ed.execCommand( 'mceInsertRawHTML', 0, output );
            }); // addCommand datalet
        },
 
        /**
         * Creates control instances based in the incoming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} n Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl : function(n, cm) {
            return null;
        },
 
        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'RouteToPa Buttons',
                author : 'Luca Vicidomini',
                authorurl : 'http://wp.tutsplus.com/author/leepham',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/example',
                version : "0.1"
            };
        }
    });
 
    // Register plugin
    tinymce.PluginManager.add( 'routetopa', tinymce.plugins.RouteToPa );
})();