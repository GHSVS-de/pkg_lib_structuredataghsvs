# pkg_lib_structuredataghsvs
- Joomla package that installs the structured data PHP library [spatie/schema-org](https://github.com/spatie/schema-org) in Joomla folder `/libraries/structuredataghsvs/`. Not more, not less.
- I load/initialise it in extensions, respectively helpers, like this:

```
<?php
defined('_JEXEC') or die;

require_once JPATH_LIBRARIES . '/structuredataghsvs/vendor/autoload.php';

// and then for example:
use Spatie\SchemaOrg\Schema;
use Spatie\SchemaOrg\Organization;

```
# Be aware
- The package has a size of 6 to 7 MB depending on the size of [spatie/schema-org].
  - The unzipped files have a **size of 30 to 40 MB**.
- This is a Joomla `package` extension instead of just a simple `library` extension. This is simply because so far Joomla does not support the `<scriptfile>` tag for library installations.
- So after installation you will find two extensions named "Structuredataghsvs" in the extension manager.
- Stupid, but no further problem.
- To uninstall the library uninstall the package.

-----------------------------------------------------

# My personal build procedure (WSL 1, Debian, Win 10)

**@since versions greater then 2022.04.19_3.11.0.0: Build procedure uses local repo fork of https://github.com/GHSVS-de/buildKramGhsvs**

# My personal build procedure
- Prepare/adapt `./package.json`.
- `cd /mnt/z/git-kram/pkg_lib_structuredataghsvs/`

## node/npm updates/installation
- `npm install` (if never done before)

### Update dependencies
- `npm run updateCheck` or (faster) `npm outdated`
- `npm run update` (if needed) or (faster) `npm update --save-dev`

## Check package.json overrides
Extensions in src/packages/**/ may have a file `packageOverride.json` that can be merged into the main `package.json` during build.

Thus you can override some parameters for `replaceXml.js` of repo `buildKramGhsvs`.

Not documented. Therfore see `./build.js` (`helper.mergeJson`, `replaceXmlOptions.jsonString`).

## composer
- The composer.json is located in folder `./_composer`
- Check for `spatie/schema-org` updates.

```
cd _composer/

composer outdated

OR

composer show -l
```
- both commands accept the parameter `--direct` to show only direct dependencies in the listing

- If somethig to bump/update:

```
composer update

OR

composer install
```

## Build installable ZIP package
- `cd ..` (if you're still in `_composer/`).
- `node build.js`
- New, installable ZIP is in `./dist` afterwards.
- Packed files for this ZIP can be seen in `./package`. **But only if you disable deletion of this folder at the end of `build.js`**.

### For Joomla update and changelog server
- Create new release with new tag.
  - See release description in `dist/release.txt`.
- Extracts(!) of the update and changelog XML for update and changelog servers are in `./dist` as well. Copy/paste and necessary additions.
