<?php
/**
 * @package RouteToPa
 * @version 0.1
 */
/*
Plugin Name: ROUTE-TO-PA Datalets
Plugin URI: https://github.com/routetopa/wordpress-datalet
Version: 0.1
Description: Development version.
Author: Luca Vicidomini
Author URI: http://vicidomini.net/
License: MIT
License URI: https://opensource.org/licenses/MIT
*/

defined( 'ABSPATH' ) or die( '' );

class RouteToPaDatalet {

	public function __construct() {
		add_shortcode( $this->get_shortcode(), array( $this, 'render_shortcode' ) );
		add_filter( 'no_texturize_shortcodes', array( $this, 'get_preserved_shortcodes' ) );
		add_action( 'wp_head', array( $this, 'insert_scripts' ) );
	} // __construct

	public function render_shortcode( $atts, $content='' ) {
		return html_entity_decode( $content );
	} // render_shortcode

	public function insert_scripts() {
		echo '<script type="text/javascript" src="https://cdn.jsdelivr.net/webcomponentsjs/0.7.16/webcomponents-lite.min.js"></script>';
		echo '<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>';
	} // insert_scripts

	public function get_preserved_shortcodes() {
		return array( $this->get_shortcode() );
	}

	function get_shortcode() {
		return 'datalet';
	}

} // class RouteToPaDatalet

new RouteToPaDatalet(); 

