**Mission Critical Tasks:**

- Update secrets.js to match new Mongo Database
- Update + Postman test routes:
  - index
  - users [DONE v1]
  - resumes [DONE v1]
  - comments
    - Compare POST 2-way referencing method of resumes and comments
  - templates
- Google drive API integration

**Integration w/ Frontend:**

- Update all routes addresses as needed
- Ensure package.json compatibility
-

**Optimization:**

- Reduce code redundancy in POST calls. Implement as middleware.
- Delete DEBUG and TODO code before production

**Misc Notes**

- PDF Storage:
  - Including a new data:Buffer field in the schema allows for pdf storage.
  - The ID of the file (resume, template) can then be used to as the URL
  - http://localhost:4000/pdf/id will return the PDF file
- Use templates as a testbed for pdf storage as it isn't linked to user data

Citing:

- https://blog.logrocket.com/multer-nodejs-express-upload-file/
