#!/usr/bin/env node
const path = require('path');

/* Configure START */
const pathBuildKram = path.resolve("../buildKramGhsvs");
const updateXml = `${pathBuildKram}/build/update.xml`;
const changelogXml = `${pathBuildKram}/build/changelog.xml`;
const releaseTxt = `${pathBuildKram}/build/release.txt`;
/* Configure END */

const replaceXml = require(`${pathBuildKram}/build/replaceXml.js`);
const helper = require(`${pathBuildKram}/build/helper.js`);

const pc = require(`${pathBuildKram}/node_modules/picocolors`);
const fse = require(`${pathBuildKram}/node_modules/fs-extra`);

let replaceXmlOptions = {};
let zipOptions = {};
let from = "";
let to = "";

const {
	filename,
	name,
	nameReal,
	version,
} = require("./package.json");

const vendorPath = `./_composer/vendor`;
const packagesDir = `./package/packages`;
const libDir = `${packagesDir}/lib_structuredataghsvs`;

// By package abweichend. Nicht filename.
const manifestFileName = `${name}.xml`;
const Manifest = path.resolve(`./package/${manifestFileName}`);
const jsonMain = './package.json';

const manifestFileNameChild = `${filename}.xml`;
const manifestChild = `${libDir}/${manifestFileNameChild}`;
const jsonChild = `${libDir}/packageOverride.json`;

let versionSub = '';
let thisPackages = [];

(async function exec()
{
	let cleanOuts = [
		`./package`,
		`./dist`,
	];
	await helper.cleanOut(cleanOuts);

	from = path.join(__dirname, vendorPath, `composer/installed.json`)
	versionSub = await helper.findVersionSub (from, 'spatie/schema-org');
	console.log(pc.magenta(pc.bold(`versionSub identified as: "${versionSub}"`)));

	from = `./src`;
	to = `./package`;
	await helper.copy(from, to);

	console.log(pc.magenta(pc.bold(`Be patient! Bigger copy action.`)));
	from = vendorPath;
	to = `${libDir}/vendor`;
	await helper.copy(from, to);

	to = './dist';

	if (!(await fse.exists(to)))
	{
		await fse.mkdir(to).then(
			answer => console.log(pc.yellow(pc.bold(`Created "${to}".`)))
		);
	}

	// ##### The Library (child). START.

	// package/packages/lib_structuredataghsvs/structuredataghsvs.xml
	let jsonString = await helper.mergeJson(
		[path.resolve(jsonMain), path.resolve(jsonChild)]
	)

	let zipFilename = `${JSON.parse(jsonString).name}-${version}_${versionSub}.zip`;

	replaceXmlOptions = {
		"xmlFile": path.resolve(manifestChild),
		"zipFilename": zipFilename,
		"checksum": "",
		"dirname": __dirname,
		"thisPackages": thisPackages,
		"jsonString": jsonString
	};

	await replaceXml.main(replaceXmlOptions);

	from = manifestChild;
	to = `./dist/${manifestFileNameChild}`
	await helper.copy(from, to);

	// ## Create child zip file.
	let zipFilePath = path.resolve(`./${packagesDir}/${zipFilename}`);

	zipOptions = {
		"source": path.resolve(libDir),
		"target": zipFilePath
	};
	await helper.zip(zipOptions);

	thisPackages.push(
		`<file type="library" id="structuredataghsvs">${zipFilename}</file>`
	);
	await helper.cleanOut([libDir]);
	// ##### The Library (child). END.

	// ##### The Package (main). START.
	zipFilename = `${nameReal}-${version}_${versionSub}.zip`;

	// package/pkg_structuredataghsvs.xml
	replaceXmlOptions.xmlFile = Manifest;
	replaceXmlOptions.zipFilename = zipFilename;
	replaceXmlOptions.thisPackages = thisPackages;
	replaceXmlOptions.jsonString = "";

	await replaceXml.main(replaceXmlOptions);
	from = Manifest;
	to = `./dist/${manifestFileName}`
	await helper.copy(from, to);

	// ## Create main zip file.
	zipFilePath = path.resolve(`./dist/${zipFilename}`);

	zipOptions = {
		"source": path.resolve("package"),
		"target": zipFilePath
	};
	await helper.zip(zipOptions)

	const Digest = 'sha256'; //sha384, sha512
	const checksum = await helper.getChecksum(zipFilePath, Digest)
  .then(
		hash => {
			const tag = `<${Digest}>${hash}</${Digest}>`;
			console.log(pc.green(pc.bold(`Checksum tag is: ${tag}`)));
			return tag;
		}
	)
	.catch(error => {
		console.log(error);
		console.log(pc.red(pc.bold(
			`Error while checksum creation. I won't set one!`)));
		return '';
	});

	replaceXmlOptions.checksum = checksum;

	// Bei diesen werden zuerst Vorlagen nach dist/ kopiert und dort erst "replaced".
	for (const file of [updateXml, changelogXml, releaseTxt])
	{
		from = file;
		to = `./dist/${path.win32.basename(file)}`;
		await helper.copy(from, to);

		replaceXmlOptions.xmlFile = path.resolve(to);
		await replaceXml.main(replaceXmlOptions);
	}

	cleanOuts = [
		`./package`,
	];

	await helper.cleanOut(cleanOuts).then(
		answer => console.log(
			pc.cyan(pc.bold(pc.bgRed(`Finished. Good bye!`)))
		)
	);
})();
