# Giber Eats

The Backend of Giber Eats

## User Entity

- id
- createdAt
- updatedAt

- email
- password
- role ( client | owner | delivery )

## User CRUD

- Create Account [x]
- Log in [x]
- See Profile [x]
- Edit Profile [x]
- Verify Email [x]

## Restaurant Entity

- name
- category
- address
- coverImage

## Restaurant CRUD

- See Restaurant [x]
- See Restaurants (pagination) [x]
- See Restaurants by Category (pagination) [x]
- Search Restaurant [x]

- Edit Restaurant [x]
- Delete Restaurant Logically [x]

- See Catergories [x]

- Create Dish [x]
- Edit Dish [x]
- Delete Dish [x]

## Orders Entity

- customer
- driver
- restaurant
- items
- total
- status

## Orders CRUD

- Create Order [x]
- See Orders (pagination) [x]
- See Order [x]
- Edit Order (Owner, Delivery) [x]

## Orders Subscription ( Owner, Customer, Delivery )

## Payment (Cron JOB)
