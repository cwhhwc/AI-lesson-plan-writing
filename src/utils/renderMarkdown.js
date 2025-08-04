import { marked } from 'marked'
import katex from 'katex'

/**
 * 将markdown文本渲染为HTML，支持KaTeX数学公式
 * @param {string} md - markdown文本
 * @returns {string} 渲染后的HTML
 */
export function renderMarkdown(md) {
  // 先用marked解析markdown
  let parsedHtml = marked.parse(md)
  
  // 处理行内数学公式 $...$，不包括换行符，采用非贪婪匹配
  parsedHtml = parsedHtml.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: false })
    } catch (error) {
      console.error('KaTeX error:', error)
      return match
    }
  })
  
  // 处理块级数学公式 $$...$$，包含任意字符，采用非贪婪匹配
  parsedHtml = parsedHtml.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: true })
    } catch (error) {
      console.error('KaTeX error:', error)
      return match
    }
  })
  
  return parsedHtml
} 