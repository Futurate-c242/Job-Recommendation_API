# Job Recommendation API

This API currently is:
- Under active development.
- Intended for internal use only.

## Base URL

[https://job-recommendation-apii-352594405825.asia-southeast2.run.app](https://job-recommendation-apii-352594405825.asia-southeast2.run.app)

## Endpoints

Send your request body in JSON.

### POST `/recommendations`

The endpoint to generate a job recommendation.

```json
// request body in JSON
{
  "userID": "9udDJY4pn0YrdOo3hfIm2lVf63E2"
}
```

### POST `/recommendations` response
```json
// request body in JSON
{
    "jobs": [
        "Software Developer",
        "Outside Consultant",
        "Functional Outside Consultant",
        "Other",
        "Content Developer",
        "Project Manager-Production/Manufacturing/Maintenance",
        "Construction-Construction Management",
        "Head/VP/GM-Technology(IT)/CTO",
        "Trainee",
        "Head/VP/GM-Operations"
    ]
}
```


