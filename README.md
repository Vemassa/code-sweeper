# Code-Sweeper

## About
Code-Sweeper cleans up unused constants in your project. Use it directly with `npx` to scan your entire project or a specified path. Add `--clean` to automatically remove unused constants.

## Usage
**Scan Project:**
```shell
npx code-sweeper
```

**Scan Specific Path:**
```shell
npx code-sweeper ./path/to/scan
```

**Clean Unused Constants:** 
```shell
npx code-sweeper --clean
```

**Path & Clean:** 
```shell
npx code-sweeper ./path/to/scan --clean
```

## Disclaimer
Code-Sweeper is not flawless and may not detect every unused constant or could potentially identify constants as unused incorrectly. Always review changes before applying them.

## Contributing
Contributions welcome. Fork, create your branch, commit your changes, push to your branch, and open a pull request.

## License
MIT License.
