<script lang="ts">
	import type { GeoJSON, Map, TileLayer } from 'leaflet'
	import { browser } from '$app/environment'
	import L from 'leaflet'
	import { onDestroy, onMount } from 'svelte'

	interface GeoJSONWithBoundingBox extends GeoJSON.Feature<GeoJSON.Point> {
		boundingbox: [number, number, number, number]
	}

	export let geoJSON: GeoJSONWithBoundingBox | null = null

	let mapContainer: HTMLDivElement
	let map: Map
	let geoJSONLayer: GeoJSON
	let updateGeoJSON: () => void

	onMount(async () => {
		if (browser) {
			const L = await import('leaflet')
			await import('leaflet/dist/leaflet.css')

			updateGeoJSON = () => {
				if (geoJSONLayer) {
					map.removeLayer(geoJSONLayer)
				}
				if (geoJSON) {
					geoJSONLayer = L.geoJSON(geoJSON).addTo(map)
					map.flyToBounds(
						[
							[geoJSON.boundingbox[0], geoJSON.boundingbox[2]],
							[geoJSON.boundingbox[1], geoJSON.boundingbox[3]],
						],
						{ duration: 1 },
					)
				}
			}

			map = L.map(mapContainer).setView([0, 0], 2)

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			} as L.TileLayerOptions).addTo(map)

			if (geoJSON) {
				updateGeoJSON()
			}
		}
	})

	$: if (map && geoJSON) {
		updateGeoJSON()
	}

	onDestroy(() => {
		if (map) {
			map.remove()
		}
	})
</script>

<main>
	<div class="border-2 border-black" bind:this={mapContainer}></div>
</main>

<style>
	div {
		height: 300px;
		width: 100%;
	}
</style>
