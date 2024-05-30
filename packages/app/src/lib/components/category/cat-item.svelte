<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'
	import * as Card from '$lib/components/ui/card/index.js'

	import ImgPlaceHolder from '../product/imgPlaceHolder.svelte'

	export let category: RichCat
	const { id, name, description, parentId, productCount } = category
</script>

<a href={`/cat/n/${name}`}>
	<Card.Root class="cursor-pointer border-4 border-black bg-transparent text-black">
		<ImgPlaceHolder imageType={'thumbnail'} />
		<Card.Footer class="flex items-start justify-between p-4">
			<section class=" flex flex-col">
				<span class="truncate font-bold">{name}</span>
				<span>{description}</span>
				{productCount}
			</section>
		</Card.Footer>
	</Card.Root>
</a>
