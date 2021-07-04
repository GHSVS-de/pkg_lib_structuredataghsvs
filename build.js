const fse = require('fs-extra');
const util = require("util");
const rimRaf = util.promisify(require("rimraf"));
const chalk = require('chalk');
// const exec = util.promisify(require('child_process').exec);
const path = require('path');

const {
	author,
	creationDate,
	copyright,
	filename,
	name,
	nameReal,
	version,
	licenseLong,
	minimumPhp,
	maximumPhp,
	minimumJoomla,
	maximumJoomla,
	allowDowngrades,
	description,
} = require("./package.json");

const vendorPackageName = 'spatie/schema-org';
const packagesDir = `./package/packages`;
const libDir = `${packagesDir}/lib_structuredataghsvs`;

const pkgManifest = `./package/pkg_${filename}.xml`;
const libManifest = `${path.join(libDir, filename)}.xml`;

//process.exit(0);

async function cleanOut (cleanOuts) {
	for (const file of cleanOuts)
	{
		await rimRaf(file).then(
			answer => console.log(chalk.redBright(`rimrafed: ${file}.`))
		).catch(error => console.error('Error ' + error));
	}
}

(async function exec()
{
	// ### House cleaning - START
	let cleanOuts = [
		`./package`,
		`./dist`,
	];

	await cleanOut(cleanOuts);
	// ### House cleaning - END

	// ### Get Spatie version - START
	let sourceInfos = '';
	const {
		packages,
	} = require("./_composer/vendor/composer/installed.json");

	packages.forEach((package) => {
		if (package.name === vendorPackageName)
		{
			sourceInfos = package.version;
		}
	});

	console.log(chalk.yellowBright(`Using ${vendorPackageName} version ${sourceInfos}`));
	// ### Get Spatie version - END

	await console.log(chalk.redBright(`Be patient! Copy actions!`));

	// Copy /src/ base folder.
	await fse.copy("./src", "./package"
	).then(
		answer => console.log(chalk.yellowBright(`Copied ./src to ./package.`))
	);

	// Copy vendor to lib_folder.
	await console.log(chalk.redBright(`Be very patient! Composer copy actions!`));
	await fse.copy("./_composer/vendor", `${libDir}/vendor`
	).then(
		answer => console.log(chalk.yellowBright(`Copied _composer/vendor to ${libDir}/vendor.`))
	);

	let xml = await fse.readFile(libManifest, { encoding: "utf8" });
	xml = xml.replace(/{{name}}/g, name);
	xml = xml.replace(/{{nameUpper}}/g, name.toUpperCase());
	xml = xml.replace(/{{authorName}}/g, author.name);
	xml = xml.replace(/{{creationDate}}/g, creationDate);
	xml = xml.replace(/{{copyright}}/g, copyright);
	xml = xml.replace(/{{licenseLong}}/g, licenseLong);
	xml = xml.replace(/{{authorUrl}}/g, author.url);
	xml = xml.replace(/{{version}}/g, version);
	xml = xml.replace(/{{minimumPhp}}/g, minimumPhp);
	xml = xml.replace(/{{maximumPhp}}/g, maximumPhp);
	xml = xml.replace(/{{minimumJoomla}}/g, minimumJoomla);
	xml = xml.replace(/{{maximumJoomla}}/g, maximumJoomla);
	xml = xml.replace(/{{allowDowngrades}}/g, allowDowngrades);
	xml = xml.replace(/{{filename}}/g, filename);
	xml = xml.replace(/{{description}}/g, description);

	await fse.writeFile(libManifest, xml, { encoding: "utf8" }
	).then(
		answer => console.log(chalk.yellowBright(`Replaced entries in ${libManifest}.`))
	);
// process.exit(0);

	// ### Pack the library (child) - START.
	let zip = new (require("adm-zip"))();
	const libZipFilename = `${name}-${version}_${sourceInfos}.zip`;

	let zipFilename = `${packagesDir}/${libZipFilename}`;
	zip.addLocalFolder(libDir, false);
	zip.writeZip(`${zipFilename}`);
	console.log(chalk.greenBright(`${packagesDir}/${libZipFilename} written.`));

	cleanOuts = [
		`${libDir}`,
	];
	await cleanOut(cleanOuts).then(
		answer => console.log(chalk.yellowBright(`Child done. Start with package now.`))
	);
	// ### Pack the library (child) - END.

	xml = await fse.readFile(pkgManifest, { encoding: "utf8" });
	xml = xml.replace(/{{zipFilenameLibrary}}/g, libZipFilename);
	xml = xml.replace(/{{name}}/g, name);
	xml = xml.replace(/{{nameUpper}}/g, name.toUpperCase());
	xml = xml.replace(/{{authorName}}/g, author.name);
	xml = xml.replace(/{{creationDate}}/g, creationDate);
	xml = xml.replace(/{{copyright}}/g, copyright);
	xml = xml.replace(/{{licenseLong}}/g, licenseLong);
	xml = xml.replace(/{{authorUrl}}/g, author.url);
	xml = xml.replace(/{{version}}/g, version);
	xml = xml.replace(/{{minimumPhp}}/g, minimumPhp);
	xml = xml.replace(/{{maximumPhp}}/g, maximumPhp);
	xml = xml.replace(/{{minimumJoomla}}/g, minimumJoomla);
	xml = xml.replace(/{{maximumJoomla}}/g, maximumJoomla);
	xml = xml.replace(/{{allowDowngrades}}/g, allowDowngrades);
	xml = xml.replace(/{{filename}}/g, filename);
	xml = xml.replace(/{{description}}/g, description);

	await fse.writeFile(pkgManifest, xml, { encoding: "utf8" }
	).then(
		answer => console.log(chalk.yellowBright(`Replaced entries in ${pkgManifest}.`))
	);

	// Create new dist dir.
	if (!(await fse.exists("./dist")))
	{
    	await fse.mkdir("./dist"
		).then(
			answer => console.log(chalk.yellowBright(`Created ./dist.`))
		);
	}

	zip = new (require("adm-zip"))();
	const pkgZipFilename = `pkg_${name}-${version}_${sourceInfos}.zip`;
	zipFilename = `./dist/${pkgZipFilename}`;
	zip.addLocalFolder('./package', false);
	zip.writeZip(`${zipFilename}`);
	console.log(chalk.greenBright(`./dist/${pkgZipFilename} written.`));

	cleanOuts = [
		`./package`,
	];

	await cleanOut(cleanOuts).then(
		answer => console.log(chalk.yellowBright(`Finish.`))
	);
})();
