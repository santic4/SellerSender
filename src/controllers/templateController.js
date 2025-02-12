import { Template } from '../models/Template.js';

export const createTemplate = async (req, res) => {
  const { name, content, assignedPublications } = req.body;
  console.log(name,'name,', content, 'content,', assignedPublications,'assignedPublications')
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

export const updateTemplate = async (req, res, next) => {
  const { id } = req.params; // id de la plantilla a actualizar
  const { name, content, assignedPublications } = req.body; // datos a actualizar

  try {
    console.log('entre')
    // Buscar la plantilla por su id
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: "Plantilla no encontrada" });
    }

    // Actualizar los campos
    template.name = name;
    template.content = content;
    // Se espera que assignedPublications sea un arreglo, en caso contrario se asigna un arreglo vacío
    template.assignedPublications = Array.isArray(assignedPublications) ? assignedPublications : [];

    // Guardar la plantilla actualizada
    const updatedTemplate = await template.save();

    res.status(200).json(updatedTemplate);
  } catch (error) {
    next(error);
  }
};