package controllers;

import models.ContentNode;
import models.ContentType;
import models.vo.IdTitle;
import models.vo.SearchResult;
import play.Logger;
import play.mvc.With;

import java.util.List;

/**
 * Access to content nodes (the central entities of cmskern) via the editoiral UI,
 * for direct access please leverage {@link ContentNodesApi} (via RESTful routes).
 *
 * @author Niko Schmuck
 * @since 23.01.2012
 */
@With(Secure.class)
public class ContentNodes extends Application {


    @Check("editor,admin")
    public static void blank(String type) {
        ContentType contentType = ContentType.findByName(type);
        notFoundIfNull(contentType, "Unknown content type: " + type);

        render(contentType);
    }

    @Check("editor,admin")
    public static void edit(String type, Long id) {
        ContentType contentType = ContentType.findByName(type);
        notFoundIfNull(contentType, "Unknown content type: " + type);
        ContentNode contentNode = ContentNode.findById(id);
        notFoundIfNull(contentNode, "Unknown content node ID: " + id);

        render(contentNode, contentType);
    }

    @Check("editor,admin")
    public static void versions(String type, Long id) {
        ContentNode contentNode = ContentNode.findById(id);
        notFoundIfNull(contentNode, "Unknown content node ID: " + id);
        List<ContentNode> versions = ContentNode.findVersionsForId(id);
        render(type, contentNode, versions);
    }

    public static void list(String type, int page) {
        ContentType contentType = ContentType.findByName(type);
        notFoundIfNull(contentType, "Unknown content type: " + type);

        int pageSize = Application.getPageSize();
        if (page <= 0) {
            page = 1;
            Logger.debug("Page number set to default: %d", page);
        }
        int offset = (page-1) * pageSize;
        String searchTerm = params.get("search");
        SearchResult<ContentNode> nodes = ContentNode.findByTypeAndTitle(contentType.name, searchTerm, false, offset, pageSize);
        int totalCount = nodes.totalCount;
        Logger.info("Listing %s nodes: found %d total ...", contentType.name, totalCount);
        render(contentType, nodes, page, pageSize, totalCount);
    }

    /**
     * Returns JSON with simple data structure (id and title) of
     * content nodes which titles do match with the specified query string.
     * This method can be leveraged by AJAX auto-complete search box for example.
     */
    public static void search(String type, String q, int limit) {
        List<IdTitle> nodes = ContentNode.findByTypeAndTitleMinimal(type, q, false, 0, limit);
        renderJSON(nodes);
    }

}
