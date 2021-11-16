# koa-oas3

## 2.4.1

### Patch Changes

- fc66894: fix documentation

## 2.4.0

### Minor Changes

- dd5d075: add oasValidatorOptions for oas-validator

## 2.3.3

### Patch Changes

- df65a22: bump oas3 chow chow

## 2.3.2

### Patch Changes

- 7b113c2: Fix setting of ctx.oas.request.path

## 2.3.1

### Patch Changes

- 66d53f9: Release security patches

## 2.3.0

### Minor Changes

- c21df6b: Update oas3-chow-chow to 1.2.0

## 2.2.0

### Minor Changes

- 20e3c7f: Update version of oas3-chow-chow to 1.1.3

## 2.1.1

### Patch Changes

- ff054a8: Bump oas-validator

## 2.1.0

### Minor Changes

- 74ab9f1: Set operationId when parsing request

## 2.0.2

### Patch Changes

- e5897fb: Include types qs

## 2.0.1

### Patch Changes

- e384d03: Patch qs type error

## 2.0.0

### Major Changes

- 7d71651: oas() is now an async function

## 1.0.1

### Patch Changes

- c21cece: Bump oas3-chow-chow to 1.1.1

## 1.0.0

### Major Changes

- 22538ed: Bump oas3 to the first major version

## 0.19.0

### Minor Changes

- 978b610: Adds options for querystring parsing for validation.

  This allows individuals to specify options for how incoming query strings should be parsed (such as for array structures). By default it maintains the existing option of parsing commas as a delimiter for entries in an array parameter. For more info on how to inject different options see README.md

### Patch Changes

- 287f903: Fix compiling error during build

## 0.18.0

### Minor Changes

- 7556223: Update oas3-chow-chow dependency to 0.18.0

### Patch Changes

- 66cfd18: Fix registry

## 0.17.1

### Patch Changes

- 0b31da1: Bump handlebars for security fix

## 0.17.0

### Minor Changes

- c39a5e4: When constructing ChowChow object, pass in ChowOptions so that library users can sepecify ChowChow/AVJ options

## 0.16.1

### Patch Changes

- 69976f9: Bump packages

## 0.16.0

### Minor Changes

- 84b6d1e: Use qs module to parse query-string before validation

### Patch Changes

- 9c1f7d9: Fix issue #21

## 0.15.0

### Minor Changes

- c6c6711: Bump oas3-chow-chow to support parameter on path level
