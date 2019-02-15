## The web as an application platform - 1DV527

### By Johan Söderlund

# SmartHome
Aims to solve ...

## Questions

1. How have you implemented the idea of HATEOAS in your API? Motivate your choices and how it support the idea of HATEOAS.

2. If your solution should implement multiple representations of the resources. How would you do it?

3. Motivate and defend your authentication solution? Why did you choose the one you did? Pros/Cons.

4. Explain how your web hook works.

5. Since this is your first own web API there are probably things you would solve in an other way looking back at this assignment. Write your thoughts down.

6. Did you do something extra besides the fundamental requirements? Explain them.


# Documentation

**Webhook callback url for users**
https://webhook.site/#/898fbdcd-b9b3-476a-b8bd-74ca4f3dad26/8d0fee74-4bfa-4d89-a491-058cd9bc9133/1

**/drop**
Use with care! Will drop user and home collection! Is used to reset the database for testing purposes. If you need to recreate users ONLY. This will get the side effect that old tokens will not be valid for POSTMAN collection, for the newly created users you have to copy the token and update the POSTMAN environment variables. Same goes for POSTMAN methods to newly created homes with links /homes/:id, were :id needs to be updated. To do this use method GET /homes to retrieve the ids under links object in the body response.

