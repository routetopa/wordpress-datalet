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
                output += ' v="2"';
                output += ']';
                output += btoa(encodeURIComponent(datalets.join( '' )));
                output += '[/datalet]';

                if ( ! ed.execCommand( 'mceInsertRawHTML', 0, output ) )
                	ed.execCommand( 'mceInsertContent', 0, output )
            }); // addCommand datalet

            ed.on( 'ResolveName', function( event ) {
                var dom = ed.dom,
                    node = event.target;
                if ( node.nodeName === 'IMG' && dom.getAttrib( node, 'data-rtpa-datalet' ) ) {
                    if ( dom.hasClass( node, 'rtpa-datalet-placeholder' ) ) {
                        event.name = 'datalet';
                        }
                    }
            });

            ed.on( 'BeforeSetContent', function( event ) {
                var replaceDataletShortcodes = function( content ) {
                    var placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAaCAYAAAD7aXGFAAAC40lEQVRYhe2Zz0vbYBjHP4rkT4iXXIo/CtNOXIc3QRC8KIiIgqgnQWEI7akFBzoQBIuHVxiCK9rTDAj5BwrFoGAv3ZgLDLRCDuaUi6LmEsHt1IDTanRlqZAPvIe8ed7nefLlfZ73hTSMTc9+ApYIqUoTsJRKfuD9u66gc6k7St+PyIgNmgC6uzq5ubkJOqe6o7urE4BGgNvb20CTqVcqujQGnMeroKk2bo7YnslS8J7f8nFrlje1cR444U7yQSiSD0KRfPDfRUokEkiS5I2pqSny+XzN/Nu2jSRJ2LZdM5/PFOmI7Zl5Jr3xhV8vCKqqKq7r4rouIyMjDA0NoWnao2scx6Gjo6NmH69pGkIIX7aBl9vo6CiqqrK4uPioneM4lMvlmsU9OzvzbRu4SAC9vb2Uy2VM0/TKpTI0TcO2bRRFAUBRFG8HDAwMeHaJROJB3/l8/k5pm6aJEIJUKkUqlfJVmlXuSf/33iPLMgDX19dEIhFc1wXAMAzi8Tjn5+dYloWiKFiW5dlXepnjOPT09FAsFmlpafH8GobB2toax8fHRCIRcrkcQgjW19c9m2Qy+WR+NbpM/humaQLQ3NyMbdvs7OyQzWa98nIc58F1uVyOQqHA7u4uAFdXV3fen5ycoOs60WjUm+vr63t2fnVRbrquMz4+jizLbGxsUCqV2Nvbw7Ksqms0TUNVVdLpNK7rVv34hYUF75BwXfdFJ2ngIgkhmJubY3l5GYDT01P6+/uRZZmDg4N79pVddXl5iSzLxGIxDMNA1/V7tu3t7aysrGAYxoOxLy4ufOUYiEgTExNeMzVN0+sZAOl0mkKhgCRJ7O/ve2tkWSaTyRCNRhFCMDg4SGtrK5Iksbq6Sltb2704sViMzc1N4vG4F69YLAIwPDzM4eGhr8bdMDY9+/vr1ue/pqs17ufOv34mZ+aDL7fXQCiSD6qUW0iFsNx8Eorkg0aAbz9+Bp1HXVLRpSH8Ofk0fwBR1zQOVQn9YQAAAABJRU5ErkJggg==";
                    return content.replace( /\[datalet([^\]]*)\]([A-Za-z0-9+/=_-]*)\[\/datalet\]/g, function( match ) {
                        return '<img class="rtpa-datalet-placeholder" src="'+ placeholder +'" data-rtpa-datalet="' + encodeURIComponent(match) + '" data-mce-placeholder="1">';
                    });
                }

                //if ( /*! editor.plugins.wpview ||*/ typeof wp === 'undefined' || ! wp.mce ) {
                    event.content = replaceDataletShortcodes( event.content );
                //}
            });

            ed.on( 'PostProcess', function( event ) {
                var restoreDataletShortcodes = function( content ) {
                    function getAttr( str, name ) {
                        name = new RegExp( name + '=\"([^\"]+)\"' ).exec( str );
                        return name ? window.decodeURIComponent( name[1] ) : '';
                    }
                    return content.replace( /(?:<p(?: [^>]+)?>)*(<img [^>]+>)(?:<\/p>)*/g, function( match, image ) {
                        var data = getAttr( image, 'data-rtpa-datalet' );
                        if ( data ) {
                            return '<p>' + data + '</p>';
                        }
                        return match;
                    });
                }
                if ( event.get ) {
                    event.content = restoreDataletShortcodes( event.content );
                }
            });
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