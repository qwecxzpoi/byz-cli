#!/usr/bin/env node

// based on https://github.com/vitejs/vite/tree/main/packages/create-vite/index.js

// @ts-check
const fs = require('fs')
const path = require('path')
// avoids auto conversion to number of the project name by defining that the args
const argv = require('minimist')(process.argv.slice(2), { string: ['_'] })
// 提示
const prompts = require('prompts')
// 控制台文字颜色
const {
    yellow,
    green,
    cyan,
    blue,
    magenta,
    red,
    reset
} = require('kolorist')

// 获取当前路径
const cwd = process.cwd()

// 框架列表
const FRAMEWORKS = [
    {
        name: 'vue',
        color: green,
        variants: [
            {
                name: 'vue',
                display: 'JavaScript',
                color: yellow
            },
            {
                name: 'vue-ts',
                display: 'TypeScript',
                color: blue
            }
        ]
    },
    {
        name: 'react-ts',
        color: cyan,
    },
    {
        name: 'nest',
        color: magenta,
    }
]

// 获取所有的模板名称
const TEMPLATES = FRAMEWORKS.map(
    (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), [])

// 重命名文件信息
const renameFiles = {
    _gitignore: '.gitignore',
    _eslintrc: '.eslintrc'
}

async function init() {
    // 项目路径
    let targetDir = argv._[0]
    // 获取模板名称，对象为 --template 或 -t
    let template = argv.template || argv.t

    // 项目名称
    const defaultProjectName = !targetDir
        ? 'vite-project'
        // 去掉空格，删除结尾的 '/'
        : targetDir.trim().replace(/\/+$/g, '')

    let result = {}

    try {
        result = await prompts(
            [
                // 项目名称
                {
                    type: targetDir ? null : 'text',
                    name: 'projectName',
                    message: reset('Project name:'),
                    initial: defaultProjectName,
                    onState: (state) =>
                        (targetDir =
                            state.value.trim().replace(/\/+$/g, '') || defaultProjectName)
                },
                // 是否重载目标目录
                {
                    type: () =>
                        !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm',
                    name: 'overwrite',
                    message: () =>
                        (targetDir === '.'
                            ? 'Current directory'
                            : `Target directory "${targetDir}"`) +
                        ` is not empty. Remove existing files and continue?`
                },
                // 重载检测
                {
                    type: (_, { overwrite } = {}) => {
                        if (overwrite === false) {
                            throw new Error(red('✖') + ' Operation cancelled')
                        }
                        return null
                    },
                    name: 'overwriteChecker'
                },
                // package.json - name 名称变为项目名称
                {
                    type: () => (isValidPackageName(targetDir) ? null : 'text'),
                    name: 'packageName',
                    message: reset('Package name:'),
                    initial: () => toValidPackageName(targetDir),
                    validate: (dir) =>
                        isValidPackageName(dir) || 'Invalid package.json name'
                },
                // 选择框架
                {
                    // template 包含在框架列表中则不用选择，否则进入选项
                    type: template && TEMPLATES.includes(template) ? null : 'select',
                    name: 'framework',
                    message:
                        typeof template === 'string' && !TEMPLATES.includes(template)
                            ? reset(
                                `"${template}" isn't a valid template. Please choose from below: `
                            )
                            : reset('Select a framework:'),
                    initial: 0,
                    choices: FRAMEWORKS.map((framework) => {
                        const frameworkColor = framework.color
                        return {
                            title: frameworkColor(framework.name),
                            value: framework
                        }
                    })
                },
                // 是否存在子目录
                {
                    type: (framework) =>
                        framework && framework.variants ? 'select' : null,
                    name: 'variant',
                    message: reset('Select a variant:'),
                    // @ts-ignore
                    choices: (framework) =>
                        framework.variants.map((variant) => {
                            const variantColor = variant.color
                            return {
                                title: variantColor(variant.name),
                                value: variant.name
                            }
                        })
                }
            ],
            {
                // 取消
                onCancel: () => {
                    throw new Error(red('✖') + ' Operation cancelled')
                }
            }
        )
    } catch (cancelled) {
        console.log(cancelled.message)
        return
    }

    // user choice associated with prompts
    const { framework, overwrite, packageName, variant } = result

    const root = path.join(cwd, targetDir)

    if (overwrite) {
        emptyDir(root)
    } else if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true })
    }

    // determine template. 如果没有变种，则 framework.name
    console.log(framework);
    template = variant || framework?.name || template

    console.log(`\nScaffolding project in ${root}...`)

    const templateDir = path.join(__dirname, `template-${template}`)

    const write = (file, content) => {
        const targetPath = renameFiles[file]
            ? path.join(root, renameFiles[file])
            : path.join(root, file)
        if (content) {
            fs.writeFileSync(targetPath, content)
        } else {
            copy(path.join(templateDir, file), targetPath)
        }
    }

    const files = fs.readdirSync(templateDir)
    for (const file of files.filter((f) => f !== 'package.json')) {
        write(file)
    }

    const pkg = require(path.join(templateDir, `package.json`))

    pkg.name = packageName || targetDir

    write('package.json', JSON.stringify(pkg, null, 2))

    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
    const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

    console.log(`\nDone. Now run:\n`)
    if (root !== cwd) {
        console.log(`  cd ${path.relative(cwd, root)}`)
    }
    switch (pkgManager) {
        case 'yarn':
            console.log('  yarn')
            console.log('  yarn dev')
            break
        default:
            console.log(`  ${pkgManager} install`)
            console.log(`  ${pkgManager} run dev`)
            break
    }
    console.log()
}

function copy(src, dest) {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
        copyDir(src, dest)
    } else {
        fs.copyFileSync(src, dest)
    }
}

function isValidPackageName(projectName) {
    return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
        projectName
    )
}
// 转换名称格式
function toValidPackageName(projectName) {
    return projectName
        // 去掉末尾空格
        .trim()
        // 全小写
        .toLowerCase()
        // 将数字替换为空字符
        .replace(/\s+/g, '-')
        // 将 . 与 _ 替换为空字符
        .replace(/^[._]/, '')
        // 将除了 a-z0-9-~ 以外的字符转换为 -。 ^ 在 [] 中表示非
        .replace(/[^a-z0-9-~]+/g, '-')
}

/**
 * 复制文件
 * @param {string} srcDir 路径
 * @param {string} destDir 目标路径
 */
function copyDir(srcDir, destDir) {
    // 递归创建目录
    fs.mkdirSync(destDir, { recursive: true })
    // 读取路径中的文件并将文件名遍历出来
    for (const file of fs.readdirSync(srcDir)) {
        // 路径+文件名
        const srcFile = path.resolve(srcDir, file)
        // 目标+文件名
        const destFile = path.resolve(destDir, file)
        // 复制
        copy(srcFile, destFile)
    }
}

// 判断目录是否为空，如果有一个 .git 仍然判为空文件夹
function isEmpty(path) {
    const files = fs.readdirSync(path)
    return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

// 清空目录
function emptyDir(dir) {
    if (!fs.existsSync(dir)) {
        return
    }
    for (const file of fs.readdirSync(dir)) {
        const abs = path.resolve(dir, file)
        // vite baseline is Node 12 so can't use rmSync, but i baseline is Node 16
        fs.rmSync(abs, { recursive: true, force: true })
    }
}

/**
 * @param {string | undefined} userAgent process.env.npm_config_user_agent
 * @returns object | undefined
 */
function pkgFromUserAgent(userAgent) {
    if (!userAgent) return undefined
    const pkgSpec = userAgent.split(' ')[0]
    const pkgSpecArr = pkgSpec.split('/')
    return {
        name: pkgSpecArr[0],
        version: pkgSpecArr[1]
    }
}

init().catch((e) => {
    console.error(e)
})
