# ku-softarch-midterm

An addtional of flixtube by adding advertising service

## Quickstart
By using the docker compose
```bash
$ docker compose up -d --build
```

## System diagram

![SoftArch Midterm](https://user-images.githubusercontent.com/25188615/221345495-8fcf951d-eb9b-433f-bd54-4ad11dbda3a2.jpg)


## Addtional

1. Create the API for creating the ads in gateway and proxy it to advertising service.

- (Gateway Service)

**POST** /api/createAds/
Body:
```json
{
  "name": "Something",
  "link": "https://google.com"
}
```

_Will delegate the requets to_

- (Advertising Service)

**POST** /createAds

_Note: It accept the same body as gateway_

Example
```bash
$ curl -X "POST" "http://localhost:4000/api/createAds/" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "name": "TestHelloWorldadsfp",
  "link": "https://google.comasdofkasdfokapsodkf"
}'

```
