package controllers;

import com.mongodb.DBObject;
import models.ContentNode;
import models.ContentType;
import play.Logger;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Router;
import play.mvc.With;

import java.util.HashMap;
import java.util.Map;

/**
 * This class can be considered as the RESTful way to approach
 * the content node repository.
 *
 * @author Niko Schmuck
 */
@With(Secure.class)
public class ContentNodesApi extends Controller {

    public static void getBody(String type, Long id) {
        ContentNode contentNode = ContentNode.findById(id);
        notFoundIfNull(contentNode, "Unknown content ID: " + id);
        Logger.info("Deliver body with ID: %s (%s)", contentNode.getId(), type);
        renderJSON(contentNode.getJsonContent());
    }

    public static void getFull(String type, Long id) {
        DBObject obj = ContentNode.findByIdRaw(id);
        notFoundIfNull(obj, "Unknown content ID: " + id);
        Logger.info("Deliver raw %s for ID: %s ...", type, id);
        renderJSON(obj.toString());
    }

    /**
     * Redirects to the location of the binary Blob as
     * refered by the given content node in the specified property.
     */
    public static void redirectToBinary(String type, Long id, String propertyName) {
        ContentNode imageNode = ContentNode.findById(id);
        notFoundIfNull(imageNode, "Unknown content ID: " + id);
        // ~~
        String refVal = imageNode.getProperty(propertyName);
        notFoundIfNull(refVal, "Property " + propertyName + " not available");
        // Construct Image URL
        Map<String, Object> argMap = new HashMap<String, Object>(1);
        argMap.put("id", refVal);
        String url = Router.getFullUrl("Blobs.getBinaryById", argMap);
        Logger.info("Redirecting %s to: %s...", type, url);
        redirect(url);
    }

    @Check("editor,admin")
    public static void create(String type, String body) {
        Logger.debug("Going to create: %s ... ", body);
        ContentType contentType = ContentType.findByName(type);
        notFoundIfNull(contentType, "Unknown content type: " + type);

        ContentNode contentNode = new ContentNode(contentType.name, body);
        String username = Security.connected();
        contentNode.create(username);
        // deliver back location of new content resource
        Logger.info("Created new content node with ID: %s", contentNode.getId());
        response.status = Http.StatusCode.CREATED;
        response.setHeader("Location", String.format("%s/%s/%d", request.getBase(), type, contentNode.getId()));
        renderJSON("{\"id\": \"" + contentNode.getId() + "\"}");
    }

    @Check("editor,admin")
    public static void update(String type, Long id, String body) {
        ContentType contentType = ContentType.findByName(type);
        notFoundIfNull(contentType, "Unknown content type: " + type);

        ContentNode contentNode = ContentNode.findById(id);
        notFoundIfNull(contentNode, "Unknown content node ID: " + id);

        Logger.info("Going to update %s with ID %s ...", type, id);
        String username = Security.connected();
        contentNode.update(username, body);
        renderJSON("{\"id\": \"" + contentNode.getId() + "\"}");
    }

    @Check("admin")
    public static void delete(String type, Long id) {
        ContentNode contentNode = ContentNode.findById(id);
        notFoundIfNull(contentNode, "Unknown content node ID: " + id);
        Logger.info("Going to delete %s with ID %s ...", type, id);
        contentNode.delete();
    }

}