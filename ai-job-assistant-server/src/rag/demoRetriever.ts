import {
  formatRetrievedKnowledge,
  retrieveKnowledge,
} from './retriever';

async function main() {
  const query = 'AI应用开发 LangChain RAG 结构化输出';

  const results = retrieveKnowledge(query, 3);

  console.log('Query:', query);
  console.log('Retrieved knowledge:');
  console.log(JSON.stringify(results, null, 2));

  console.log('\nFormatted context:');
  console.log(formatRetrievedKnowledge(results));
}

main().catch((error) => {
  console.error('Retriever demo failed:', error);
  process.exit(1);
});
