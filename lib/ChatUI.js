import { useState, useCallback, useRef } from "react";
import { SELECTED_MODEL } from "../core/SELECTED_MODEL.JS";

export default function ChatUI({ engine }) {
  const [chatLoaded, setChatLoaded] = useState(false);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatRequestChain = useRef(Promise.resolve());

  const pushTask = useCallback((task) => {
    const lastEvent = chatRequestChain.current;
    chatRequestChain.current = lastEvent.then(task);
  }, []);

  const asyncInitChat = useCallback(
    async (messageUpdate) => {
      if (chatLoaded) return;
      setRequestInProgress(true);
      messageUpdate("init", "", true);

      const initProgressCallback = (report) => {
        messageUpdate("init", report.text, false);
      };
      engine.setInitProgressCallback(initProgressCallback);

      try {
        const selectedModel = SELECTED_MODEL;
        await engine.reload(selectedModel);
        setChatLoaded(true);
      } catch (err) {
        messageUpdate("error", "Init error, " + (err?.toString() ?? ""), true);
        console.log(err);
        await unloadChat();
      } finally {
        setRequestInProgress(false);
      }
    },
    [chatLoaded, engine]
  );

  const unloadChat = useCallback(async () => {
    await engine.unload();
    setChatLoaded(false);
  }, [engine]);

  const asyncGenerate = useCallback(
    async (prompt, messageUpdate, setRuntimeStats) => {
      await asyncInitChat(messageUpdate);
      setRequestInProgress(true);

      if (prompt === "") {
        setRequestInProgress(false);
        return;
      }

      messageUpdate("right", prompt, true);

      try {
        const newChatHistory = [...chatHistory, { role: "user", content: prompt }];
        setChatHistory(newChatHistory);

        let curMessage = "";
        let usage = undefined;

        messageUpdate("left", "", true);

        const completion = await engine.chat.completions.create({
          stream: true,
          messages: newChatHistory,
          stream_options: { include_usage: true },
        });

        for await (const chunk of completion) {
          const curDelta = chunk.choices[0]?.delta.content;
          if (curDelta) {
            curMessage += curDelta;
            messageUpdate("left", curMessage, false);
          }
          if (chunk.usage) {
            usage = chunk.usage;
          }
        }

        const output = await engine.getMessage();
        const updatedHistory = [...newChatHistory, { role: "assistant", content: output }];
        setChatHistory(updatedHistory);
        messageUpdate("left", output, false);

        if (usage) {
          const runtimeStats =
            `prompt_tokens: ${usage.prompt_tokens}, ` +
            `completion_tokens: ${usage.completion_tokens}, ` +
            `prefill: ${usage.extra.prefill_tokens_per_s.toFixed(4)} tokens/sec, ` +
            `decoding: ${usage.extra.decode_tokens_per_s.toFixed(4)} tokens/sec`;
          setRuntimeStats(runtimeStats);
        }
      } catch (err) {
        messageUpdate("error", "Generate error, " + (err?.toString() ?? ""), true);
        console.log(err);
        await unloadChat();
      } finally {
        setRequestInProgress(false);
      }
    },
    [chatHistory, engine, asyncInitChat, unloadChat]
  );

  const onGenerate = useCallback(
    async (prompt, messageUpdate, setRuntimeStats) => {
      if (requestInProgress) return;

      pushTask(async () => {
        await asyncGenerate(prompt, messageUpdate, setRuntimeStats);
      });

      return chatRequestChain.current;
    },
    [requestInProgress, pushTask, asyncGenerate]
  );

  const onReset = useCallback(
    async (clearMessages) => {
      if (requestInProgress) {
        engine.interruptGenerate();
      }

      setChatHistory([]);

      pushTask(async () => {
        await engine.resetChat();
        clearMessages();
      });

      return chatRequestChain.current;
    },
    [requestInProgress, engine, pushTask]
  );

  return {
    onGenerate,
    onReset,
    requestInProgress,
    chatLoaded,
  };
}
