import { Template } from '../models/Template.js';

export const createTemplate = async (req, res) => {
  const { name, content, assignedPublications } = req.body;

  try {
    const template = new Template({ name, content, assignedPublications });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Error al crear plantilla:', error);
    res.status(500).send('Error al crear plantilla');
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).send('Error al obtener plantillas');
  }
};
