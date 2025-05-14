import { Template } from "../models/Template.js";

class TemplatesDAO{
    async getTemplatesDAO(){

        const template = await Template.find();
  
        return template;
    };

    async getTemplateByID(id){

            const template = await Template.findById(id);
            console.log(template,'template en dAo')

        return template;
    };

}

export const templatesDao = new TemplatesDAO()
