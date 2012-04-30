package controllers;

import com.mongodb.gridfs.GridFS;
import com.mongodb.gridfs.GridFSDBFile;
import com.mongodb.gridfs.GridFSInputFile;
import jobs.Thumbnailer;
import models.Asset;
import org.bson.types.ObjectId;
import play.Logger;
import play.libs.MimeTypes;
import play.mvc.Controller;
import play.mvc.With;
import utils.MongoDbUtils;

import java.util.Collection;

/**
 * Access to files stored in the Blob store (currently making use
 * of GridFS provided by MongoDB).
 *
 * @author Niko Schmuck
 * @since 27.02.2012
 */
@With(Secure.class)
public class Blobs extends Controller {

    @Check("editor,admin")
    public static void upload(String qqfile) {
        Logger.info("Starting to upload %s ...", qqfile);

        GridFS gfs = MongoDbUtils.getGridFS();
        GridFSInputFile dbFile = gfs.createFile(request.body);
        dbFile.setFilename(qqfile);
        // guess content type from file name extension
        String contentType = MimeTypes.getContentType(qqfile);
        if (contentType == null || !contentType.startsWith("image/")) {
            // No valid content type (TODO: could verify against list of allowed content types)
            renderJSON("{\"error\":\"Invalid content type: " + contentType + " \"}");
        } else {
            // Valid content type: try to store it
            dbFile.setContentType(contentType);
            dbFile.save();
            // Start to generate thumbnailing job asynchronously
            new Thumbnailer((ObjectId) dbFile.getId()).now();
            renderJSON("{\"success\":true}");
        }
    }

    @Check("editor,admin")
    public static void list() {
        Logger.info("Listing all assets (JSON) ...");
        Collection<Asset> assets = Asset.findAllOriginals();
        renderJSON(assets);
    }

    @Check("editor,admin")
    public static void listAssets() {
        Logger.info("Listing assets ...");
        Collection<Asset> assets = Asset.findAllOriginals();
        render(assets);
    }

    @Check("editor,admin")
    public static void listAssetsForTinyMCE() {
        Logger.info("Listing assets (for TinyMCE) ...");
        Collection<Asset> assets = Asset.findAllOriginals();
        render(assets);
    }


    public static void getOriginalById(String id) {
        Logger.info("Lookup asset by id: %s", id);
        GridFSDBFile dbFile = MongoDbUtils.getFileById(id);
        notFoundIfNull(dbFile);
        Logger.info("    ... return GridFS file: %s", dbFile.getFilename());

        response.contentType = dbFile.getContentType();
        renderBinary(dbFile.getInputStream());
    }

    public static void getThumbById(String id) {
        // we might want to split this into an own GridFS collection...
        getOriginalById(id);
    }

    public static void getByName(String name) {
        Logger.info("Lookup asset by name: %s", name);
        GridFSDBFile dbFile = MongoDbUtils.getFileByFilename(name);
        notFoundIfNull(dbFile);
        Logger.info("    ... return GridFS file: %s", dbFile.getFilename());

        response.contentType = dbFile.getContentType();
        renderBinary(dbFile.getInputStream());
    }

}