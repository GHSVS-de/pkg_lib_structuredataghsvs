const fse = require('fs-extra');
const util = require("util");
const chalk = require('chalk');
// const exec = util.promisify(require('child_process').exec);
const path = require('path');
const replaceXml = require('./build/replaceXml.js');
const helper = require('./build/helper.js');

let thisPackages = [];

const {
	filename,
	name,
	version,
} = require("./package.json");

const vendorPath = `./_composer/vendor`;
const packagesDir = `./package/packages`;
const libDir = `${packagesDir}/lib_structuredataghsvs`;
const manifestFileName = `pkg_${filename}.xml`;
const Manifest = `${__dirname}/package/${manifestFileName}`;

(async function exec()
{
	let cleanOuts = [
		`./package`,
		`./dist`,
	];

	await helper.cleanOut(cleanOuts);

	versionSub = await helper.findVersionSub (
		path.join(__dirname, vendorPath, `composer/installed.json`),
			'spatie/schema-org');
	console.log(chalk.magentaBright(`versionSub identified as: "${versionSub}"`));

	await console.log(chalk.redBright(`Be patient! Copy actions!`));

	await fse.copy(`./src`, `./package`
	).then(
		answer => console.log(chalk.yellowBright(`Copied "./src" to "./package".`))
	);

	// Copy vendor to lib_folder.
	await console.log(chalk.redBright(`Be patient! Composer copy actions!`));
	await fse.copy(`${vendorPath}`, `${libDir}/vendor`
	).then(
		answer => console.log(chalk.yellowBright(
			`Copied "_composer/vendor" to "${libDir}/vendor".`))
	);

	if (!(await fse.exists(`./dist`)))
	{
    	await fse.mkdir(`./dist`
		).then(
			answer => console.log(chalk.yellowBright(`Created "./dist".`))
		);
  }

	// ##### Zip the Library (child). START.
	// package/packages/lib_structuredataghsvs/structuredataghsvs.xml
	let zipFilename = `${name}-${version}_${versionSub}.zip`;
	let zipFile = `${path.join(__dirname, packagesDir, zipFilename)}`;
	let folderToZip = libDir;

	let xmlFileName = `${filename}.xml`;
	let xmlFile = `${path.join(__dirname, libDir, xmlFileName)}`;

	await replaceXml.main(xmlFile);

	await fse.copy(xmlFile, `./dist/${xmlFileName}`).then(
		answer => console.log(chalk.yellowBright(
			`Copied "${xmlFileName}" to "./dist".`))
	);

	let zip = new (require("adm-zip"))();
	zip.addLocalFolder(folderToZip, false);
	await zip.writeZip(zipFile);
	console.log(chalk.cyanBright(chalk.bgRed(`"${zipFile}" written.`)));

	await helper.cleanOut([libDir]);

	thisPackages.push(
		`<file type="library" id="structuredataghsvs">${zipFilename}</file>`
	);
	// ##### Zip the Library (child). END.

	// ##### Zip the Package (main). START.
	// package/pkg_structuredataghsvs.xml
	zipFilename = `pkg_${zipFilename}`;
	zipFile = `${path.join(__dirname, `dist`, zipFilename)}`;
	folderToZip = `./package`;

	xmlFileName = manifestFileName;
	xmlFile = Manifest;

	await replaceXml.main(xmlFile, null, null, thisPackages);

	await fse.copy(xmlFile, `./dist/${xmlFileName}`).then(
		answer => console.log(chalk.yellowBright(
			`Copied "${xmlFileName}" to "./dist".`))
	);

	zip = new (require("adm-zip"))();
	zip.addLocalFolder(folderToZip, false);
	await zip.writeZip(zipFile);
	console.log(chalk.cyanBright(chalk.bgRed(`"${zipFile}" written.`)));
	// ##### Zip the Package (main). END.

	const Digest = 'sha256'; //sha384, sha512
	const checksum = await helper.getChecksum(zipFile, Digest)
  .then(
		hash => {
			const tag = `<${Digest}>${hash}</${Digest}>`;
			console.log(chalk.greenBright(`Checksum tag is: ${tag}`));
			return tag;
		}
	)
	.catch(error => {
		console.log(error);
		console.log(chalk.redBright(`Error while checksum creation. I won't set one!`));
		return '';
	});

	xmlFile = 'update.xml';
	await fse.copy(`./${xmlFile}`, `./dist/${xmlFile}`).then(
		answer => console.log(chalk.yellowBright(
			`Copied "${xmlFile}" to ./dist.`))
	);
	await replaceXml.main(`${__dirname}/dist/${xmlFile}`, zipFilename, checksum);

	xmlFile = 'changelog.xml';
	await fse.copy(`./${xmlFile}`, `./dist/${xmlFile}`).then(
		answer => console.log(chalk.yellowBright(
			`Copied "${xmlFile}" to ./dist.`))
	);
	await replaceXml.main(`${__dirname}/dist/${xmlFile}`, zipFilename, checksum);

	xmlFile = 'release.txt';
	await fse.copy(`./${xmlFile}`, `./dist/${xmlFile}`).then(
		answer => console.log(chalk.yellowBright(
			`Copied "${xmlFile}" to ./dist.`))
	);
	await replaceXml.main(`${__dirname}/dist/${xmlFile}`, zipFilename, checksum,
		thisPackages);

	cleanOuts = [
		`./package`,
	];

	await helper.cleanOut(cleanOuts).then(
		answer => console.log(chalk.cyanBright(chalk.bgRed(
			`Finished. Good bye!`)))
	);
})();
