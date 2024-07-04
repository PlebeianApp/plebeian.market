<script lang="ts">
	export let width = 500
	export let height = 600
	export let fillColor = '#cccccc'
	export let imageType: 'main' | 'thumbnail' | 'gallery' | 'mini' = 'thumbnail'
	if (imageType == 'main') {
		width = 400
		height = 500
	} else if (imageType == 'gallery') {
		width = 200
		height = 150
	} else if (imageType == 'thumbnail') {
		width = 308
		height = 329
	} else if (imageType == 'mini') {
		width = 80
		height = 80
	}
</script>

<svg {width} {height} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
	<defs>
		<style type="text/css">
			#holder text {
				fill: #000000;
				font-family: sans-serif;
				font-size: 30px;
				font-weight: 100;
			}
		</style>
	</defs>
	<g id="holder">
		<rect width="100%" height="100%" fill={fillColor}></rect>
		<g>
			<text text-anchor="middle" x="50%" y="50%" dy=".3em">{width} x {height}</text>
		</g>
	</g>
</svg>
