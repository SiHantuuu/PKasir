import fs from "fs/promises"

const packageJsonPath = "./package.json"

try {
  // Read the existing package.json file
  const packageJsonContent = await fs.readFile(packageJsonPath, "utf8")
  const packageJson = JSON.parse(packageJsonContent)

  // Add xlsx to the dependencies if it doesn't exist
  if (!packageJson.dependencies.xlsx) {
    packageJson.dependencies.xlsx = "^0.18.5"

    // Write the updated package.json back to the file
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

    console.log("Successfully added xlsx to package.json")
  } else {
    console.log("xlsx is already in the dependencies")
  }
} catch (error) {
  console.error("Error updating package.json:", error)
}

