<?php
/**
 * @package RouteToPa
 * @version 1.0
 */
/*
Plugin Name: ROUTE-TO-PA Datalets
Plugin URI: https://github.com/routetopa/wordpress-datalet
Version: 1.4
Description: Integrates a SPOD Datalet into a Wordpress article.
Author: Luca Vicidomini
Author URI: http://routetopa.eu/
License: MIT
License URI: https://opensource.org/licenses/MIT
*/

defined( 'ABSPATH' ) or die( '' );

class RouteToPaDatalet {
	const VERSION = '1.4';

	/**
	 * Register Wordpress' hooks and filters.
	 */
	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'insert_backend_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'insert_frontend_scripts' ) );
		add_filter( 'mce_buttons', array( $this, 'register_editor_buttons' ) );
		add_filter( 'mce_external_plugins', array( $this, 'add_editor_buttons' ) );
		add_filter( 'no_texturize_shortcodes', array( $this, 'get_preserved_shortcodes' ) );
		add_filter( 'tiny_mce_before_init', array( $this, 'alter_editor_settings') );
		add_shortcode( 'datalet', array( $this, 'render_shortcode_datalet' ) );
	} // __construct

	/**
	 * Enqueue scripts needed for datalets.
	 * 
	 * @return void
	 */
	public function insert_frontend_scripts() {
        wp_enqueue_script('webcomponents', plugins_url( 'js/webcomponents-lite.min.js', __FILE__ ), false, self::VERSION);
        wp_enqueue_script('webcomponents-htmlmports', plugins_url( 'js/html-imports.min.js', __FILE__ ), array('webcomponents'), self::VERSION);
        wp_enqueue_script('rtpa-lazy', plugins_url( 'js/lazy.js', __FILE__ ), array('jquery'), false, self::VERSION);
        wp_enqueue_style('rtpa-lazy-css', plugins_url( 'css/lazy.css', __FILE__ ), false, self::VERSION);
	} // insert_scripts

	public function insert_backend_scripts() {
		wp_enqueue_style( 'routetopa-datalet', plugins_url( 'css/editor.css', __FILE__ ), false, self::VERSION );
	}

	/**
	 * Show the "Datalet" button in TinyMCE.
	 * 
	 * @param  array $buttons Array of TinyMCE buttons
	 * @return array		  Updated array of TinyMCE buttons
	 */
	public function register_editor_buttons( $buttons ) {
		array_push( $buttons, 'datalet' );
		return $buttons;
	} // register_editor_buttons

	/**
	 * Add our JavaScript plugin to TinyMCE.
	 * 
	 * @param  array $plugin_array Array of TinyMCE plugins
	 * @return array			   The updated array of plugins
	 */
	public function add_editor_buttons( $plugin_array ) {
		$plugin_array[ 'routetopa' ] = plugins_url( 'js/editor.js', __FILE__ );
		return $plugin_array;
	} // add_editor_buttons

	/**
	 * Disable WP_Texturized in our shortcodes
	 * 
	 * @param  array $shortcodes The array of Wordpress shortcodes
	 * @return array			 Updated array of enabled shortcodes
	 */
	public function get_preserved_shortcodes( $shortcodes ) {
		$shortcodes[] = 'datalet';
		return $shortcodes;
	} // get_preserved_shortcodes

	/**
	 * Accomodates TinyMCE settings for our needs.
	 * 
	 * @param  array $settings TinyMCE settings
	 * @return array		   Updated TinyMCE settings
	 */
	public function alter_editor_settings( $settings ) {
		// Add *-datalet tag to valid elements. Otherwise TinyMCE would filter them out.
		// The [*] rule tells TinYMCE to not filter attributes for *-datalet tags.
		$extended_valid_elements = isset( $settings[ 'extended_valid_elements' ] )
			? $settings[ 'extended_valid_elements' ]
			: '';
		if ( ! empty( $extended_valid_elements ) ) {
			$extended_valid_elements .= ',';
		}
		$settings[ 'extended_valid_elements' ] = $extended_valid_elements . '*-datalet[*]';

		// Return updated settings
		return $settings;
	} // alter_editor_settings

	/**
	 * Render the [datalet] shortcode when an article is shown.
	 * 
	 * @param  array $atts	 A key-value array containing attributes of the shortcode
	 * @param  string $content The content of the shortcode
	 * @return String		  The HTML string of the rendered shortcode
	 */
	public function render_shortcode_datalet( $atts, $content='' ) {
		$output = '';
		if ( isset( $atts[ 'script' ] ) ) {
			$scripts = explode( '|', $atts[ 'script' ] );
			foreach ( $scripts as $url ) {
				$output .= "<script type=\"text/javascript\" src=\"{$url}\"></script>";
			}
		}
		if ( isset( $atts[ 'import' ] ) ) {
			$imports = explode( '|', $atts[ 'import' ] );
			foreach ( $imports as $url ) {
				$output .= "<link rel=\"import\" href=\"{$url}\" />";
			}
		}
		if ( isset( $atts[ 'v' ] ) && '2' == $atts[ 'v' ] ) {
		    // Use Base64-encoded datalets without breaking compatibility
		    $content = urldecode ( base64_decode( $content ) );
        }
		$output .= $content;

        $output = '<div class="rtpa-lazy rtpa-hide" data-datalet="'.rawurlencode($output).'">Click to load...</div>';

		return $output;
	} // render_shortcode_datalet

} // class RouteToPaDatalet

new RouteToPaDatalet(); 
