# pkg_lib_structuredataghsvs
- Joomla package that installs the structured data library [spatie/schema-org](https://github.com/spatie/schema-org) in Joomla folder `/libraries/structuredataghsvs/`. Not more, not less.
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
- This is a Joomla `package` extension instead of just a simple `library` extension. This is simply because so far Joomla does not support the `<scriptfile>` tag for library installations.
- So after installation you will find two extensions named "Structuredataghsvs" in the extension manager.
- Stupid, but no further problem.

# Changelog
- https://updates.ghsvs.de/changelog.php?file=lib_structuredataghsvs

# My personal build procedure
- Prepare/adapt `./package.json`.

- `cd /mnt/z/git-kram/pkg_lib_structuredataghsvs/`

## node/npm updates/installation
- `npm run g-npm-update-check` or (faster) `ncu`
- `npm run g-ncu-override-json` (if needed) or (faster) `ncu -u`
- `npm install` (if needed)

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
- `cd ../` if you're still in `_composer/`.
- `node build.js`
- New, installable ZIP is in `./dist` afterwards.
- FYI: Packed files for this ZIP can be seen in `./package`. **But only if you disable deletion of this folder at the end of `build.js`**.

## For Joomla update server
- Create new release with new tag.
- Get download link for new `dist/plg_blahaba_blubber...zip` **inside new tag branch** and add to release description and update the update XML.
