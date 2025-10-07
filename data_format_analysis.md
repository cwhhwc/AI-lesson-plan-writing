# 新旧AI服务数据格式对比分析

这两种数据格式都遵循流式传输（Server-Sent Events），但在核心的 `data` JSON对象结构上存在显著差异。为了方便您对比，主要变化罗列如下：

---

### **核心差异分析**

#### **1. 文本内容的路径和字段名**

这是最关键的变化，直接影响您如何提取AI返回的文字。

*   **旧格式:**
    *   路径相对简单，文本在 `output.text`。
    *   `data.output.text`

*   **新格式:**
    *   路径层级更深，并且字段名也变了。文本在 `output.workflow_message.message.content`。
    *   `data.output.workflow_message.message.content`

#### **2. 流式结束的标志和最终结果**

如何判断对话结束，以及如何获取完整对话内容的方式也完全不同。

*   **旧格式:**
    *   通过检查 `output.finish_reason` 是否为 `"stop"` 来判断结束。
    *   结束时，会收到一个 `finish_reason` 为 `"stop"` 且 `text` 为 `""` (空字符串) 的最终消息。
    *   您需要自己拼接之前收到的所有 `text` 字段来获得完整回复。

*   **新格式:**
    *   同样是通过检查 `output.finish_reason` 是否为 `"stop"` 来判断结束。
    *   **但区别巨大**：结束时，您会收到一个**特殊的、独立的**最终消息。这个消息的 `output` 对象里**不再有 `workflow_message`**，而是直接包含一个 `text` 字段 (`output.text`)，这个字段的值是**整个完整的回复内容**。
    *   这意味着，在新格式下，您甚至可以忽略中间过程，只等待最后一条 `finish_reason: "stop"` 的消息来一次性获取完整结果。

#### **3. 数据结构的整体变化**

*   **旧格式:**
    *   `output` 对象里直接包含 `session_id`, `finish_reason`, `text`。

*   **新格式:**
    *   `output` 对象里新增了一个名为 `workflow_message` 的复杂对象，它包裹了消息内容 (`message`) 和一些工作流节点信息 (`node_status`, `node_type` 等)。这是旧格式完全没有的。

#### **4. `usage` 对象**

*   **旧格式:**
    *   在流式传输过程中，`usage` 对象里包含了 `input_tokens` 和 `output_tokens` 等统计信息。

*   **新格式:**
    *   在流式传输过程中，`usage` 对象是一个空对象 `{}`。

---

### **总结与建议**

您需要创建一个“转换器”函数，它的核心任务就是：

1.  接收**新格式**的数据。
2.  检查数据中是否包含 `workflow_message`。
3.  如果包含，就从 `data.output.workflow_message.message.content` 中提取文本。
4.  然后，将这个文本包装成**旧格式**的样子，即 `{"output": {"text": "提取到的文本"}}`。
5.  如果收到的新数据 `finish_reason` 是 `"stop"`，您的转换器也需要生成一个符合旧格式的结束信号，即 `{"output": {"finish_reason": "stop", "text": ""}}`。

这样，您后端原有的代码逻辑就几乎不用改动了。
