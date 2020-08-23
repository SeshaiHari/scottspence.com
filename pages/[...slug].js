import { Box, IconButton, useColorMode } from '@chakra-ui/core'
import fs from 'fs'
import matter from 'gray-matter'
import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import Code from '../components/code'
import Layout from '../components/layout'
import { getPostPaths, getPostSlugs } from '../lib/posts'

const components = { code: Code }

const ThemeSelector = () => {
  const { colorMode, toggleColorMode: colorModeSet } = useColorMode(
    `light`
  )

  return (
    <Box textAlign="right" py={4}>
      <IconButton
        icon={colorMode === 'light' ? 'moon' : 'sun'}
        onClick={colorModeSet}
        variant="ghost"
      />
    </Box>
  )
}

export default function Post({ mdxSource, frontMatter }) {
  const content = hydrate(mdxSource, components)
  return (
    <Layout>
      <ThemeSelector />
      <h1>{frontMatter.title}</h1>
      {content}
    </Layout>
  )
}

export const getStaticPaths = async () => {
  return await getPostSlugs()
}

export const getStaticProps = async ({ params: { slug } }) => {
  // match the slug and the file path
  const files = getPostPaths(true)
  const matchedPath = (await files).filter(path => {
    return path.includes(slug.join(`/`))
  })
  const mdxSource = fs.readFileSync(matchedPath.toString())
  const { content, data } = matter(mdxSource)

  if (typeof data.date === 'object') {
    data.date = data.date.toString()
  }

  if (!matchedPath) {
    console.warn('No MDX file found for slug')
  }

  const mdx = await renderToString(content, components, null, data)

  return {
    props: {
      mdxSource: mdx,
      frontMatter: data,
    },
  }
}