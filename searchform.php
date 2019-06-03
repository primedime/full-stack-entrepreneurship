<?php
/**
 * Template for displaying search forms in Ignition
 *
 * Can be gotten using get_search_form();
 * @package Full_Stack_Entrepreneurship
 * @since 1.0
 * @version 1.0
 */
?>

<?php $unique_id = esc_attr( uniqid( 'search-form-' ) ); ?>

<form role="search" method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label for="<?php echo $unique_id; ?>">
		<span class="screen-reader-text"><?php echo _x( 'Search for:', 'label', 'full-stack-entrepreneurship' ); ?></span>
	</label>
	<input type="search" id="<?php echo $unique_id; ?>" class="search-field"
	       placeholder="<?php echo esc_attr_x( 'Search &hellip;', 'placeholder', 'full-stack-entrepreneurship' ); ?>"
	       value="<?php echo get_search_query(); ?>" name="s"/>
	<button type="submit" class="search-submit input-append"><?php echo ign_get_svg( array( 'icon' => 'search' ) ); ?><span
				class="screen-reader-text"><?php echo _x( 'Search', 'submit button', 'full-stack-entrepreneurship' ); ?></span>
	</button>
</form>
