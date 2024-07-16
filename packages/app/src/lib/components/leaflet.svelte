<script lang="ts">
	import type { GeoJSON, Map } from 'leaflet'
	import { browser } from '$app/environment'
	import { onDestroy, onMount } from 'svelte'

	interface GeoJSONWithBoundingBox extends GeoJSON.Feature<GeoJSON.Point> {
		boundingbox: [number, number, number, number]
	}

	export let geoJSON: GeoJSONWithBoundingBox | null = null

	let mapContainer: HTMLDivElement
	let map: Map | undefined
	let geoJSONLayer: GeoJSON.Layer | undefined
	let updateGeoJSON: (() => void) | undefined

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet')
			await import('leaflet/dist/leaflet.css')

			updateGeoJSON = () => {
				if (geoJSONLayer && map) {
					map.removeLayer(geoJSONLayer)
				}
				if (geoJSON && map) {
					geoJSONLayer = leaflet.geoJSON(geoJSON).addTo(map)
					map.flyToBounds(
						[
							[geoJSON.boundingbox[0], geoJSON.boundingbox[2]],
							[geoJSON.boundingbox[1], geoJSON.boundingbox[3]],
						],
						{ duration: 1 },
					)
				}
			}

			map = leaflet.map(mapContainer).setView([0, 0], 2)

			leaflet
				.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				})
				.addTo(map)

			if (geoJSON) {
				updateGeoJSON()
			}
		}
	})

	$: if (browser && map && geoJSON && updateGeoJSON) {
		updateGeoJSON()
	}

	onDestroy(() => {
		if (browser && map) {
			map.remove()
		}
	})
</script>

{#if browser}
	<main>
		<div class="border-2 border-black" bind:this={mapContainer}></div>
	</main>
{/if}

<style>
	div {
		height: 300px;
		width: 100%;
	}
</style>
