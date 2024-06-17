**Background**

Our application relies on retrieving and storing data from relays. They can send us a high volume of events. We need to process and store these events in our database efficiently and scalably.

**Challenges**

A high volume of events can be a challenge to our system, as we need to process and store them without overloading our server. Additionally, we need to ensure that our system can handle the logic of different conditions and constrains of the app settings, and store them in a way that allows for efficient querying and retrieval.

**Requirements**

* Handle a high volume of events from the relays
* Process and store events efficiently and scalably

## **Proposed Solution**

### Event Processing and Storage

We will process the events from the relays using a filtering and processing pipeline. The pipeline will filter out unwanted events, process the remaining events, and store them in our database.

### Filter and processing pipeline

The pipeline will filter unwanted events. These unwanted events are determined by the different conditions the app can have in the app settings. The proposed pipeline its a basic approach that we can expand further when we integrate more features like black list of words etc. 
![[Pasted image 20240612133903.png]]

### Optimisation Strategies

To optimise the performance and scalability of our system, we can implement the following strategies:

### 1. Event Debouncing Store

To reduce the frequency of writes to the database, we will implement event debouncing. This involves batching multiple events together in a in-memory store, before processing and storing them.

### 2. Asynchronous Processing

To offload the processing from the main thread and reduce the workload on the server, we will process the events asynchronously in batches from the event debouncing store.

### 4. Event Aggregation

Before storing the events in the database, we will try to aggregate the object for queries to reduce the number of writes.

## Practical implementation 
Global discovery - Allow registration: true
1. Using ndk-svelte [with ref/unref](https://github.com/nostr-dev-kit/ndk/tree/master/ndk-svelte#reference-counting-with-refunref) to fetch products:
   ```ts
	// lib/stores/nostrFetch.ts
       const nostrProductsStore = $ndk.storeSubscribe(
        { kinds: [kindProducts as number] },
        { closeOnEose: false, autoStart: false },
        Product
    );
	// Using it in a component
	<script>
	import { nostrProductsStore } from '$stores/nostrFetch.ts';
	import { onDestroy } from 'svelte';
	nostrProductsStore.ref();
	
	onDestroy(() => {
	    nostrProductsStore.unref();
	});
	</script>
	
	{$nostrProductsStore.length} products seen
    ```
2. Using the filter and processing pipeline
	```ts
	// lib/utils/processingPipeline.ts
	import { nostrProductsStore } from '$stores/nostrFetch.ts';
	
	const processedIds = new Set();
	let batch = [];
	let timeoutId = null;
	const threshold = 25;
	const timeoutDelay = 1000 * 30;
	let isInserting = false;
	
	nostrProductsRawStore.subscribe((products) => { 
		const newProducts = products
			.filter((product) => !processedIds.has(product.id)); 
		for (const product of newProducts) { 
				try {
					// Process the product and add it to the batch list
					// logic...
					processedIds.add(product.id);
					batch.push(product);
					if (batch.length >= threshold) {
						insertProductsIntoDatabase(); 
					} else { 
						clearTimeout(timeoutId);
						timeoutId = setTimeout(
								insertProductsIntoDatabase, 
								timeoutDelay
							); 
						}
				} catch (e) {
					throw Error ...
				}
			} 
		});

	async function insertProductsIntoDatabase() {
		if (isInserting) return;
		isInserting = true;
		if (batch.length > 0) { 
			try {
				const productsToInsert = batch.slice(0, threshold);
				await db.insertProducts(productsToInsert);
				batch = batch.filter((product) =>
					!productsToInsert.includes(product));
				clearTimeout(timeoutId); 
			} catch (error) { 
				throw Error ... 
			} finally { 
				isInserting = false;
			}
		}
	}
	```