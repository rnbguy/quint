# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## UNRELEASED

### Fixed

- REPL reporting a runtime error on `0^0` (#492)
- Improved how documentation is produced for VSCode compatibility (#485)
- Enable access to builtin documentation parsed from `builtin.qnt` (#485)

### Added

- Fixed missing lodash dependency (#484)

## v0.5.0 -- 2022-12-22

### Fixed

- Updated installation documentation (#471)

### Added

- Added C-like type signatures (#102)

## v0.4.0 -- 2022-12-22

### Added

- Added beginner tutorial based around REPL (#400)
- Added API documentation for builtin operators (#386)

### Changed

- Project renamed to `quint` (#458)
- REPL can now receive input that includes its prompt (#430)
- Calling `quint` without an argument now starts the REPL (#445)
- Renamed vscode plugin package to `quint-vscode` (#463)
- Renamed `quint` package to `@informalsystems/quint`, establishing it under the
  `informalsystems` organization.

### Fixed

- Return exit code 1 when typechecking fails (#389).
- Fixed static checks of polymorphic operators (#447)

## v0.3.0 -- 2022-12-05

- Began keeping CHANGELOG