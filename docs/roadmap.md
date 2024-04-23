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
				- [ ] NDK
				- [ ] js-lightning-tools
		- [x] Create db and tables
		- [ ] Design hybrid mode to fetch data from db with fallback to nostr & insert
		- [ ] Nostr functionalities
			- [ ] Use NDK svelte
			- [ ] NDK cache (index-db)
			- [ ] Logging with nip07
			- [ ] Logging with nip46
			- [ ] Logging with private key (nip-49)
			- [ ] Create stall
			- [ ] Add product
			- [ ] User sing-up, On boarding
		- [ ] User profile page ("/p/<user_id | other identifier>")
			- [ ] User info
			- [ ] User stalls
			- [ ] User products
			- [ ] Edit profile
		- [ ] Notifications
			- [ ] In page
			- [ ] Nostr DM
			- [ ] Email
		- [ ] User settings ("/settings")
			- [ ] Add payment details
			- [ ] Configure notifications
				- [ ] Email
				- [ ] DMs
			- [ ] Delete account
		- [ ] Design API
			- [ ] Base route ("/api/<_version_>/" )
			- [ ] API versioning ("v1")
			- [ ] GET
				- [ ] Users API ("/.../user/<user_id | other identifier>")
					- [ ] Returns user info like profile and stalls
				- [ ] Stalls API ("/.../stall/<stall_id>")
					- [ ] Return stall info like name, description, ...etc, and products of the stall
				- [ ] Product API ("/.../product/<product_id>")
					- [ ] Return product info
		- [ ] Creation of different sections of the app
			- [ ] Home ("/")
			- [ ] Market browser ("/market") 
			- [ ] Product pages ("/product/<product_id>")
			- [ ] User page ("/<user_id | other identifier>)
			- [ ] Stall page ("/stall/<stall_id>")

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
