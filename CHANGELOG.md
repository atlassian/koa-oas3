# koa-oas3

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
