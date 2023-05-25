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
import { savePlace, savePlaceStory } from "$lib/client/firebase";

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
      }).then((aiRes) => {
        return {
            title: aiRes.text,
            content: aiRes.text
        }
      })


      const placeSave = savePlaceStory({
        wikiId: place.wikiId,
        title: response.title,
        content: response.content,
      })
      
      return new Response(
        JSON.stringify({
            placeSave
        }),
      { headers: {  "Content-Type": "application/json" } }
      )

    return new Response(JSON.stringify(place))
}