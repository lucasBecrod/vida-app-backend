import { Inject } from '@nestjs/common';
import {} from '@langchain/openai';

export const LANGCHAIN_CLIENT = 'LANGCHAIN_CLIENT';

// Custom provider
export const InjectLangchain = () => Inject(LANGCHAIN_CLIENT);
/*  */
