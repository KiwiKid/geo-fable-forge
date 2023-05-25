import { getPlace } from "$lib/server/firebase";
import type { RequestHandler } from "./$types";
import qs from 'querystring'
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
  } from "langchain/prompts";

interface RequestParams {
	wikiId:string
}

interface ResponseType {
    ok: string
}

export const GET:RequestHandler = async ({url}) => {
    console.log('API/POPULATE/SERVER')

    const prompt_type = 'oldLegend'
    
    const query = qs.decode(url.search.slice(url.search.indexOf('?')+1)) as unknown as RequestParams;


    const place = await getPlace(query.wikiId)

    const prompts = [
        {
          prompt_type: 'oldLegend',
          prompt: `In the style of J.R.R. Tolkien's \"Lord of the Rings,\" write an exciting, fictional story and inlcude a title and core details from the {place_information} below.
          Respond with the format TITLE:[InsertStoryTitle] CONTENT:[InsertExcitingStory]`
        },
        {
          prompt_type: "galaxyExplore",
          prompt: `In the style of \"Star Wars\", write an exciting, fictional story and include a title and core details from the {place_information} below. Try generate a unique story or plot.
          Respond with the format TITLE:[InsertStoryTitle] CONTENT:[InsertExcitingStory]`
        }
      ]
      
    const matchingPrompt = prompts.filter((p) => p.prompt_type == prompt_type)

    if(matchingPrompt.length == 0){
        return new Response(
            JSON.stringify({error: {
            message: 'No matching prompt'
            }}),
            { headers: { "Content-Type": "application/json" } },
        )
    }


    const prompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
          matchingPrompt[0].prompt
         // `In the style of J.R.R. Tolkien's \"Lord of the Rings,\" write an exciting, fictional story and inlcude a title and core details from the {place_information} below.
         // Respond with the format TITLE:[InsertStoryTitle] CONTENT:[InsertExcitingStory]`
        )
        //prompts.HumanMessagePromptTemplate.fromTemplate("{input}"),
      ]);
      const promptSettings = {
        temperature: 1
      }
  
      const llm = new ChatOpenAI();
      const chain = new LLMChain({ prompt, llm });
      const response = await chain.call({ 
        place_information: place
      });
  
      let res:{text:string};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if(!response || (response.text && response.text.length == 0)){
        return new Response(
          JSON.stringify({error: {
            message: 'No text repsonse'
          }}),
          { headers: { "Content-Type": "application/json" } },
        )
      }else{
        res = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          text: response.text,
        }
      }

      TODO here, save the story and title here
      
      return new Response(
        JSON.stringify({
          data: {
            wiki_id: place.wikiId,
            content: res.text || 'No content',
            type: prompt_type,
            status: 'success'
          }
        }),
      { headers: {  "Content-Type": "application/json" } }
      )

    return new Response(JSON.stringify(place))
}