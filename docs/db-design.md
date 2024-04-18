**Users Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| user_id | VARCHAR | Primary Key, Unique identifier for each user, hexpubkey |
| name | VARCHAR | User's username |
| role | VARCHAR | User's role, "admin" \| "editor" \| "pleb" |
| display_name | VARCHAR | User's display name |
| about | VARCHAR | User's about/bio |
| image | VARCHAR | User's image url |
| banner | VARCHAR | User's banner url |
| nip05 | VARCHAR | User's nip05 address |
| lud06 | VARCHAR | User's lud06(LNURL) ln |
| lud16 | VARCHAR | User's lud16(ln-addr) ln |
| website | VARCHAR | User's website |
| zap_service | VARCHAR | User's zap service |
| created_at | TIMESTAMP | User's profile creation timestamp |
| last_login | TIMESTAMP | User's last loging ts |

**Stalls Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| user_id | VARCHAR | Foreign Key, References the user_id in the Users table |
| stall_id | VARCHAR | Primary Key, Unique identifier for each stall |
| name | VARCHAR | Name of the stall |
| description | VARCHAR | Description of the stall |
| currency | VARCHAR | Currency used in the stall |
| created_at | TIMESTAMP | Stall's creation ts |

**payment_details Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| payment_id | INT | Primary key |
| user_id | VARCHAR | Foreign Key, References the user_id in the Users table |
| stall_id | VARCHAR | Foreign Key,  References the stall_id in the stalls table |
| payment_method | VARCHAR | "ln" \| "on-chain" \| "cashu" \| "other" |
| payment_details | VARCHAR | LNURL, ln-addres, xpub, ... |



**Shipping Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| stall_id | VARCHAR | Foreign Key, References the stall_id in the Stalls table |
| shipping_id | VARCHAR | Primary Key(shipping_id, stall_id), Unique identifier for each stall |
| name | VARCHAR | Name of the shipping zone |
| shipping_method | VARCHAR | Determines shipping method |
| shipping_details | VARCHAR | Gives details related to the shipping method, and other observations |
| base_cost | DECIMAL | Base cost of the shipping |
| default | BOOLEAN | To determine the default shipping zone of a user |

**Shipping_zones Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| shipping_id | VARCHAR | Foreign Key, References the shipping_id in the shipping table |
| shipping_zone_id | VARCHAR | Primary Key, Unique identifier for each registry |
| region_code | VARCHAR | ISO 3166 format |
| country_code | VARCHAR | ISO 3166 format |
Regions jslib: https://github.com/wp-blocks/isotolanguage

**Products Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| stall_id | VARCHAR | Foreign Key, References the stall_id in the Stalls table |
| user_id | VARCHAR | Foreign Key, References the user_id in the Users table |
| product_id | VARCHAR | Primary Key, Unique identifier for each product |
| product_name | VARCHAR | Name of the product |
| description | VARCHAR | Description of the product |
| price | DECIMAL | Price of the product |
| product_type | VARCHAR | Type of the product, "simple" \| "variable" \| "variation" |
| Images | VARCHAR | Array of image URLs, optional |
| currency | DECIMAL | Currency used |
| stock_qty | INT | Quantity of products in stock |
| specs | VARCHAR | Optional array of key pair values of product specifications |
| shipping_cost | DECIMAL | Extra costs to be used per shipping zone |
| featured | BOOLEAN | Indicates if the product its featured |
| parent_id | VARCHAR | Foreign Key, References the product_id in the Products table |
| created_at | TIMESTAMP | TS of when the product was created |

**categories Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| cat_id | INT | Primary key |
| cat_name | VARCHAR | Name of the category |
| description | VARCHAR | Description for the category |
| parent_id | INT | Foreign Key, References other category in this table by it cat_id, to create subcategories |


**product_categories Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| product_id | VARCHAR | Foreign Key, References the product_id in the products table |
| cat_id | INT | Primary Key (product_id, cat_id) Foreign Key, References the cat_id in the categories table |


**Auctions Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| stall_id | VARCHAR | Foreign Key, References the stall_id in the Stalls table |
| user_id | VARCHAR | Foreign Key, References the user_id in the Users table |
| auction_id | VARCHAR | Primary Key, Unique identifier for each product |
| auction_name | VARCHAR | Name of the product |
| description | VARCHAR | Description of the auction |
| starting_bid_amount | DECIMAL | Starting bid of the auction |
| start_date | TIMESTAMP | Date the auction started / will start |
| end_date | TIMESTAMP | Date the auction ended / will end |
| Images | VARCHAR | Array of image URLs, optional |
| currency | DECIMAL | Currency used |
| specs | VARCHAR | Optional array of key pair values of product specifications |
| shipping_cost | DECIMAL | Extra costs to be used per shipping zone |
| status | VARCHAR | running, canceled |
| featured | BOOLEAN | Indicates if the product its featured |

**Bids Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| auction_id | VARCHAR | Foreign Key, References the auction_id in the Auctions table |
| user_id | VARCHAR | Foreign Key, References the user_id in the Users table |
| bid_id | VARCHAR | Primary Key, Unique identifier for each product |
| bid_amount | INT | Amount in sats |
| bid_status | VARCHAR | "accepted" \| "rejected" \| "pending" \| "winner" |
| bid_ts | TIMESTAMP | Timestamp of the bid |

**Orders Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| order_id | INTEGER | Primary Key, Unique identifier for each order |
| seller_user_id | INTEGER | Foreign Key, References the user_id in the Users table |
| buyer_user_id | INTEGER | Hexkey of the buyer |
| order_date | TIMESTAMP | Date of the order |
| status | VARCHAR | confirmed, pending, shipped, completed, canceled |
| shipping_id | VARCHAR | Foreign key, References shipping_id in Shipping table |
| address | VARCHAR | address to ship |
| zip | VARCHAR | postal code |
| city | VARCHAR | city |
| region | VARCHAR | region |
| contact_name | VARCHAR | buyer's name |
| contact_phone | VERCHAR | buyer's phone number |
| contact_email | VERCHAR | buyer's email |
| observations | VARCHAR | observations and comments |


**Order_items Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| order_id | INTEGER | Foreign Key, References the order_id in the Orders table |
| product_id | INTEGER | Primary key (order_id, product_id). Foreign Key, References the product_id in the Products table |
| qty | INT | Quantity of the product ordered |

**Invoices Table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| invoice_id | INTEGER | Primary Key, Unique identifier for each invoice |
| order_id | VARCHAR | Foreign Key, References the order_id in the Orders table |
| invoice_date | TIMESTAMP | Date of the invoice |
| total_amount | INT | Total amount of the invoice in sats |
| invoice_status | VARCHAR | Status of the invoice, "pending" \| "paid" \| "canceled" \| "refunded" |
| payment_method | VARCHAR | Payment method, "ln" \| "on-chain" \| "cashu" \| ... |
| payment_details | VARCHAR | Invoice, address, url, etc |

**Events table**

| Column Name | Data Type | Description |
| ---- | ---- | ---- |
| event_id | VARCHAR | Primary Key, Unique identifier for each event |
| event_author | VARCHAR | Foreign key, References user_id in users table |
| event_kind | INT | Event kind |
| event | VARCHAR | Stringified version of the event |
