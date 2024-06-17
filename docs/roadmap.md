**Tag 0.1.0** 
1. **New front-end**
	- **Objective:** Develop the full stack app for plebeian.market, the development aims at version/tag `0.1.0` as mpv of the new platform.
	- **Observations**:
		- The platform will have a hybrid behavior to fetch the data, first it will look if the data its available in the db, and if it will fallback into nostr, then insert data to the db.
		- Auth system will be based on [nip-98](https://github.com/nostr-protocol/nips/blob/master/98.md) 
		- Media uploads will use [nip-96](https://github.com/nostr-protocol/nips/blob/master/96.md)
	- **Steps:** 
		- [x] Project skeleton
			- [x] Creation of the monorepo using workspaces
			- [ ] Install dependencies
				- [x] Drizzle
				- [x] NDK
				- [ ] js-lightning-tools
		- [x] Create database and tables
		- [x] Design hybrid mode to fetch data from database with fallback to Nostr and insert
			- [x] Verify event before inserting into database
			- [ ] Users browsing triggers fetch Nostr data and update database if more recent
				- [ ] Based on docs: [Nostr sub and storage](https://github.com/PlebeianTech/plebeian.market/blob/main/docs/Nostr%20sub%20and%20storage.md)
		- [ ] Nostr functionalities
			- [x] Use NDK with Svelte
			- [x] NDK cache (IndexDB)
			- [x] Logging with NIP07
			- [ ] Logging with NIP46
			- [x] Logging with private key (NIP-49)
				- [x] Use IndexDB to store the private key in NIP-49 format
			- [x] Create stall
			- [ ] Add product
			- [x] User sign-up 
			- [ ] onboarding
		- [ ] E-commerce functionalities
			- [x] Product page
				- [ ] Implement variable products
				- [x] Image carrousel
			- [ ] Auction page (same as product but with bids, time to end, etc.)
			- [ ] Add to cart
			- [ ] Checkout page
			- [ ] Payment flow
		- [ ] User profile page ("/p/<user_id | other identifier>")
			- [x] User information
			- [x] User stalls
			- [x] User products
			- [ ] Edit profile
		- [ ] Notifications
			- [ ] In-page
			- [ ] Nostr DM
			- [ ] Email
		- [ ] User settings ("/settings")
			- [x] Edit profile
			- [x] Add payment details
				- [x] On-chain (xpub)
				- [ ] On-chain (Boltz or other swap service)
				- [x] LN (LUD06)
				- [x] LN (LUD16)
				- [x] Cashu
				- [x] Other (specify details and instructions) (interactive)
				- [ ] None (interactive)
			- [ ] Configure notifications
				- [ ] Email
				- [ ] DMs
			- [x] Delete account
		- [x] App setup ("/setup")
			- [x] Add new table in db for app configuration
				- [x] Set up process in first time execution
				- [x] Set admins: List of pubkeys that are admins
				- [x] Instance pubkey
				- [x] Contact details: support/contact email, etc.
			- [x] Add admins
			- [x] Remove admins
			- [ ] Add roles

		- [x] Design API
			- [x] Base route ("/api/<_version_>/" )
			- [x] API versioning ("v1")
			- [x] GET
				- [x] Users API ("/.../user/<user_id | other identifier>")
					- [x] Returns user information like profile and stalls
				- [x] Stalls API ("/.../stall/<stall_id>")
					- [x] Return stall information like name, description, ...etc, and products of the stall
				- [x] Product API ("/.../product/<product_id>")
					- [x] Return product information
		- [ ] Creation of different sections of the app
			- [x] Home ("/")
			- [ ] Market browser ("/market") 
			- [x] Product pages ("/product/<product_id>")
			- [x] User page ("/p/<user_id | other identifier>")
			- [x] Stall page ("/stall/<stall_id>")
		- [ ] BTS [(Background Task Service)](https://github.com/PlebeianTech/plebeian.market/blob/main/docs/BTS.md)
			- [ ] Add app to the monorepo
			- [ ] Add tasks table to db
			- [ ] Install croner lib
			- [ ] Create heartbeat function
			- [ ] Implement WoT computations

1.  **Integrate phoenixd**
	-  **Objective:** Integrating phoenixd into the project as a lightning solution
	-  **Deliverables:**
	   - Phoenixd service running on vps
	   - Accounting system based in externalIds
	   - Tests for lightning flow
	-  **Timeline:** 1-2 month

2.  **Deploy in production environment**
	-  **Objective:** Deploy new front-end in production environment
	-  **Timeline:** 1 week

3.  **Develop and integrate api in sveltekit project**
	-  **Objective:** Develop the api in the code base of the project and once is fully developed and tested get rid of the current api.
	- **Deliverables:** 
	   - API and front-end tests
	-  **Timeline:** 1-2 months
**Tag 0.1.0** Release.
---

**Tag 0.1.1** 
1. **Rebuild birdWathcer**
	-  **Objective:** Rebuild birdWatcher to simplify it and make it more performant
	-  **Deliverables:**
	    -  New birdWatcher code that interacts with the API
	    - Tests
	-  **Timeline:** 1-2 months
2. **Add docs and guides** 
	- **Objetive:** Write some guides and start the knowledge base of plebeian market
	- **Deliverables:** New section or subdomain in the website to host a guides and knowledge base section with learning articles.
	- **Timeline:** 1-2 weeks
3. **CMS to customize homepage:**
	- **Objetive:** Create CMS utility to customize homepage with sections blocs
	- **Deliverables:** 
		- New components and integration in the UI/UX
		- Tests
	- **Timeline:** 1-2 weeks
4. **Theming system**
	- **Objetive:** Create a theming system to allow users customize their pages
	- **Timeline:** 1-2 weeks
**Tag 0.1.1** Release.
---
